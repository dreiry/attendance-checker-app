"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react"

// FIXED: Removed "Promise" and "use()" logic for Next.js 14 compatibility
export default function ClassQRPage({ params }: { params: { id: string } }) {
  const classId = params.id // Access ID directly
  
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [classData, setClassData] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchSession = async () => {
    setIsLoading(true)
    try {
      const { data: cls } = await supabase.from("classes").select("*").eq("id", classId).single()
      setClassData(cls)

      // Look for today's active session
      const today = new Date().toISOString().split("T")[0]
      const { data: existingSession } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("class_id", classId)
        .eq("session_date", today)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingSession) {
        setSession(existingSession)
      } else {
        await createNewSession()
      }
    } catch (error) {
      toast.error("Failed to load session")
    } finally {
      setIsLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      const token = Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1) // Session valid for 1 hour

      const { data, error } = await supabase
        .from("attendance_sessions")
        .insert({
          class_id: classId,
          qr_code_token: token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      setSession(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to create new session")
    }
  }

  useEffect(() => {
    fetchSession()
  }, [classId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Use the origin from the window object in production or dev URL
  const qrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/student/scan?token=${session?.qr_code_token}`
      : ""

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Class
      </Button>

      <Card className="text-center shadow-lg border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl">{classData?.name} - Attendance QR</CardTitle>
          <CardDescription>Project this screen. Students can scan it to mark attendance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 space-y-8">
          {session ? (
            <div className="bg-white p-6 rounded-xl shadow-inner border-2 border-slate-100">
              <QRCodeSVG value={qrUrl} size={280} />
            </div>
          ) : (
            <div className="h-[256px] w-[256px] bg-muted flex items-center justify-center rounded-xl border-dashed border-2">
              <p className="text-muted-foreground">No active session</p>
            </div>
          )}

          <div className="space-y-4 w-full max-w-xs">
            <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
              Expires at: {session ? new Date(session.expires_at).toLocaleTimeString() : "N/A"}
            </div>
            
            <Button variant="outline" size="lg" className="w-full" onClick={fetchSession}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}