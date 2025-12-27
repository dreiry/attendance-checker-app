"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, KeyRound, AlertCircle } from "lucide-react"

export default function VerifyPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // For demonstration in this project, we check if the OTP is 6 digits
    // In a production app, we would verify this against the database or auth provider
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.")
      setIsLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Fetch user profile to determine dashboard redirect
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "teacher") {
      router.push("/dashboard/teacher")
    } else {
      router.push("/dashboard/student")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Security</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification code to your email. Enter the 6-digit code below to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Input
                  className="w-48 text-center text-3xl tracking-[0.5em] font-mono h-14 border-2 focus-visible:ring-primary"
                  id="otp"
                  maxLength={6}
                  placeholder="000000"
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Label htmlFor="otp" className="sr-only">
                One-Time Password
              </Label>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  OTP security prevents unauthorized sign-ins on multiple devices and reduces the risk of attendance
                  cheating.
                </p>
              </div>
            </div>
            {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Identity"}
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                  /* Resend logic */
                }}
              >
                Didn&apos;t receive the code? Resend
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
