"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Html5QrcodeScanner } from "html5-qrcode"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ScanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Initialize Scanner with Back Camera setting
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        videoConstraints: { facingMode: "environment" } // Forces Back Camera
      },
      /* verbose= */ false
    )

    // Handle Success
    async function onScanSuccess(decodedText: string) {
      if (isProcessing) return
      
      // Extract token if it's a full URL
      let token = decodedText
      if (decodedText.includes("token=")) {
        token = decodedText.split("token=")[1]
      }

      setIsProcessing(true)
      scanner.clear() // Stop camera

      try {
        toast.info("Verifying...")
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Please log in first.")

        // 1. Find Session
        const { data: session, error: sessionError } = await supabase
          .from("attendance_sessions")
          .select("id")
          .eq("qr_code_token", token)
          .single()

        if (sessionError || !session) throw new Error("Invalid QR Code")

        // 2. Mark Attendance
        const { error: logError } = await supabase.from("attendance_logs").insert({
          session_id: session.id,
          student_id: user.id,
          status: "present"
        })

        if (logError) {
          if (logError.code === "23505") throw new Error("Already scanned!")
          throw logError
        }

        toast.success("Attendance Marked!")
        setTimeout(() => router.push("/dashboard/student"), 2000)

      } catch (error: any) {
        toast.error(error.message)
        setIsProcessing(false)
        scanner.render(onScanSuccess, (err) => {})
      }
    }

    scanner.render(onScanSuccess, (err) => {})

    return () => {
      scanner.clear().catch((e) => console.error(e))
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
          {isProcessing ? (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="font-medium text-slate-600">Marking you present...</p>
            </div>
          ) : (
            <div id="reader" className="overflow-hidden rounded-xl border-2 border-slate-200"></div>
          )}
          <p className="text-xs text-center text-slate-400">
            Point camera at the teacher's screen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}