import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QrCode, LogIn, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  // Redirect if not a student (or if profile is missing, send to login to be safe)
  if (!profile || profile.role !== "student") redirect("/dashboard/teacher")

  // Fetch enrolled classes
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      class_id,
      classes (
        id,
        name,
        teacher_id,
        profiles (full_name)
      )
    `)
    .eq("student_id", user.id)

  // Fetch attendance stats
  const { data: attendanceLogs } = await supabase.from("attendance_logs").select("status").eq("student_id", user.id)
  const presentCount = attendanceLogs?.filter((log) => log.status === "present").length || 0

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Student Portal</h1>
          <p className="text-slate-500">Welcome, {profile.full_name || "Student"}.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1 md:flex-none">
            <Link href="/dashboard/student/enroll">
              <LogIn className="mr-2 h-4 w-4" />
              Join Class
            </Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/student/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="text-3xl font-bold text-green-900">{presentCount}</div>
            </div>
            <p className="text-xs text-green-600 mt-2">Sessions attended successfully</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Classes */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Instructor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments?.map((enrollment: any) => (
                <TableRow key={enrollment.class_id}>
                  <TableCell className="font-medium text-slate-900">
                    {enrollment.classes?.name || "Unknown Class"}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {/* SAFE CHECK: We use '?' to prevent crashing if profiles is null */}
                    {enrollment.classes?.profiles?.full_name || "Unknown Teacher"}
                  </TableCell>
                </TableRow>
              ))}
              {(!enrollments || enrollments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                    You haven't joined any classes yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}