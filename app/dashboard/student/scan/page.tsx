"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function ScanPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [scanStatus, setScanStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [permissionGranted, setPermissionGranted] = useState(false)
  
  const scannerRef = useRef<any>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode")
        if (!mountedRef.current) return

        const scanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            videoConstraints: { facingMode: "environment" }
          },
          /* verbose= */ false
        )

        scannerRef.current = scanner

        scanner.render(onScanSuccess, (errorMessage: any) => {
          // ignore scan failures
        })
        
        // Assume permission is interacting if we rendered successfully
        // We set a small timeout to ensure the user has time to click "Allow"
        setTimeout(() => setPermissionGranted(true), 500)

      } catch (error) {
        console.error("Failed to load scanner", error)
        setErrorMessage("Camera failed to start.")
        setScanStatus("error")
      }
    }

    async function onScanSuccess(decodedText: string) {
      if (scanStatus !== "idle") return

      try {
        if (scannerRef.current) {
          scannerRef.current.clear()
        }
      } catch (e) { console.warn("Cleanup warning", e) }

      setScanStatus("processing")
      toast.loading("Verifying...", { id: "scan-toast" })

      try {
        let token = decodedText
        if (decodedText.includes("token=")) {
          token = decodedText.split("token=")[1]
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Please log in first.")

        const { data: session, error: sessionError } = await supabase
          .from("attendance_sessions")
          .select("id")
          .eq("qr_code_token", token)
          .single()

        if (sessionError || !session) throw new Error("Invalid or Expired QR Code")

        const { error: logError } = await supabase.from("attendance_logs").insert({
          session_id: session.id,
          student_id: user.id,
          status: "present"
        })

        if (logError) {
          if (logError.code === "23505") {
             toast.success("You are already marked present!", { id: "scan-toast" })
             setScanStatus("success")
             setTimeout(() => router.push("/dashboard/student"), 2000)
             return
          }
          throw logError
        }

        toast.success("Success! You are present.", { id: "scan-toast" })
        setScanStatus("success")
        setTimeout(() => router.push("/dashboard/student"), 2500)

      } catch (error: any) {
        setErrorMessage(error.message || "Failed to mark attendance")
        setScanStatus("error")
        toast.error(error.message, { id: "scan-toast" })
      }
    }

    initScanner()

    return () => {
      mountedRef.current = false
      if (scannerRef.current) {
        try { scannerRef.current.clear() } catch (e) {}
      }
    }
  }, [router, supabase, scanStatus])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {scanStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-300">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">You are Present!</h2>
              <p className="text-slate-500 mt-2">Redirecting to dashboard...</p>
            </div>
          )}

          {scanStatus === "error" && (
            <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-300">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-700">Scan Failed</h2>
              <p className="text-slate-600 mt-2 text-center px-4">{errorMessage}</p>
              <Button onClick={() => window.location.reload()} className="mt-6" variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {scanStatus === "processing" && (
             <div className="h-[300px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="font-medium text-slate-600">Verifying attendance...</p>
             </div>
          )}

          <div className={scanStatus !== "idle" ? "hidden" : "block"}>
            {/* Added 'text-white' to force library text to be readable */}
            <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 bg-black min-h-[300px] text-white">
                
                <div id="reader"></div> 

                {!permissionGranted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-white font-medium">Requesting Camera...</span>
                    </div>
                )}
            </div>

            <p className="text-sm text-center text-slate-400 mt-4">
              Point your camera at the teacher's screen.
            </p>
          </div>

          <Button variant="ghost" onClick={() => router.back()} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}