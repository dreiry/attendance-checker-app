import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, QrCode, Users, FileSpreadsheet, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "teacher") redirect("/dashboard/student")

  const { data: classes } = await supabase
    .from("classes")
    .select("*, attendance_sessions(count)")
    .eq("teacher_id", user.id)

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500">Manage classes & track attendance.</p>
          </div>
        </div>
        <Button size="lg" className="shadow-blue-200 shadow-lg" asChild>
          <Link href="/dashboard/teacher/classes/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Class
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-100 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Classes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{classes?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card className="shadow-md border-slate-200">
        <CardHeader>
          <CardTitle>Your Classes</CardTitle>
          <CardDescription>All classes you are currently managing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Class Name</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes?.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-semibold text-slate-700">{cls.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cls.invite_code}
                      </span>
                    </TableCell>
                    <TableCell>{cls.attendance_sessions?.[0]?.count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50" asChild>
                          <Link href={`/dashboard/teacher/classes/${cls.id}/qr`}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                          <Link href={`/dashboard/teacher/classes/${cls.id}/report`}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Report
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {classes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                      No classes found. Click "Create Class" to start.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}