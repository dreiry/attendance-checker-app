"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function JoinClassPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      // 1. Find the class by Invite Code
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, name")
        .eq("invite_code", code.trim())
        .single()

      if (classError || !classData) {
        throw new Error("Invalid Invite Code. Please check and try again.")
      }

      // 2. Check if already enrolled
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("class_id", classData.id)
        .maybeSingle()

      if (existing) {
        throw new Error("You are already enrolled in this class!")
      }

      // 3. Enroll the student
      const { error: enrollError } = await supabase.from("enrollments").insert({
        student_id: user.id,
        class_id: classData.id
      })

      if (enrollError) throw enrollError

      toast.success(`Successfully joined ${classData.name}!`)
      router.push("/dashboard/student")
      router.refresh()

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl">Join a Class</CardTitle>
          <CardDescription>Enter the invite code provided by your instructor.</CardDescription>
        </CardHeader>
        <form onSubmit={handleJoin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Invite Code</Label>
              <Input
                id="code"
                placeholder="e.g. X7K9P2"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="text-center text-2xl tracking-widest uppercase py-6"
                maxLength={6}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || code.length < 3} className="w-full bg-blue-600 hover:bg-blue-700 size-lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {isLoading ? "Joining..." : "Join Class"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}