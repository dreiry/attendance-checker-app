"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ScanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [scannerLoaded, setScannerLoaded] = useState(false)
  
  // Use a ref to keep track of the scanner instance safely
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    // Variable to track if component is still mounted
    let mounted = true

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode")
        
        if (!mounted) return

        setScannerLoaded(true)

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

        scanner.render(onScanSuccess, (err: any) => {
          // Ignore scanning failures (common when moving camera)
        })
      } catch (error) {
        console.error("Failed to load scanner", error)
      }
    }

    async function onScanSuccess(decodedText: string) {
      if (isProcessing) return
      setIsProcessing(true)

      // 1. SAFE CLEANUP: Try to stop camera, but don't crash if it fails
      try {
        if (scannerRef.current) {
          await scannerRef.current.clear()
        }
      } catch (e) {
        console.warn("Camera cleanup failed (this is harmless):", e)
      }

      // 2. Process the QR Code
      try {
        toast.info("Verifying QR Code...")
        
        let token = decodedText
        // Handle both full URLs and raw tokens
        if (decodedText.includes("token=")) {
          token = decodedText.split("token=")[1]
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Please log in first.")

        // Find Session
        const { data: session, error: sessionError } = await supabase
          .from("attendance_sessions")
          .select("id")
          .eq("qr_code_token", token)
          .single()

        if (sessionError || !session) throw new Error("Invalid or Expired QR Code")

        // Mark Attendance
        const { error: logError } = await supabase.from("attendance_logs").insert({
          session_id: session.id,
          student_id: user.id,
          status: "present"
        })

        if (logError) {
          // Check for duplicate entry error (Code 23505)
          if (logError.code === "23505") {
             toast.success("You are already marked present!")
             setTimeout(() => router.push("/dashboard/student"), 2000)
             return
          }
          throw logError
        }

        toast.success("Success! Attendance Marked.")
        setTimeout(() => router.push("/dashboard/student"), 2000)

      } catch (error: any) {
        toast.error(error.message || "Failed to mark attendance")
        setIsProcessing(false)
        
        // If it failed, reload the page after 2 seconds to reset the scanner
        setTimeout(() => window.location.reload(), 2000)
      }
    }

    initScanner()

    // Cleanup function when leaving the page
    return () => {
      mounted = false
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (e) {
          // Ignore errors on unmount
        }
      }
    }
  }, [router, supabase, isProcessing])

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {!scannerLoaded && !isProcessing && (
             <div className="h-[250px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
             </div>
          )}

          <div id="reader" className="overflow-hidden rounded-xl border-2 border-slate-200"></div>

          {isProcessing && (
            <div className="flex flex-col items-center justify-center space-y-2 mt-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="font-medium text-slate-600">Marking you present...</p>
            </div>
          )}
          
          <p className="text-xs text-center text-slate-400">
            Point your camera at the teacher's screen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}