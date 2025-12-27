"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function FixAccountPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [msg, setMsg] = useState("")
  const supabase = createClient()

  const fixProfile = async () => {
    setStatus("loading")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You are not logged in.")

      // 1. Check if profile exists
      const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      
      if (existing) {
        setMsg("Your profile already exists! You are good to go.")
        setStatus("success")
        return
      }

      // 2. Create missing profile
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: "Teacher (Recovered)",
        role: "teacher"
      })

      if (error) throw error

      setMsg("Success! Your missing profile has been created.")
      setStatus("success")
    } catch (error: any) {
      setMsg(error.message)
      setStatus("error")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Account Repair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-500">
            If you can't create classes, your account might be missing its database record.
          </p>
          
          {status === "idle" && (
            <Button onClick={fixProfile} size="lg" className="w-full">
              Fix My Account
            </Button>
          )}

          {status === "loading" && <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />}

          {status === "success" && (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle2 className="h-12 w-12" />
              <p className="font-bold">{msg}</p>
              <Button asChild variant="outline" className="mt-2">
                <a href="/dashboard/teacher">Go to Dashboard</a>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-2 text-red-600">
              <AlertCircle className="h-12 w-12" />
              <p className="font-bold">Error: {msg}</p>
              <Button onClick={() => setStatus("idle")} variant="outline">Try Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}