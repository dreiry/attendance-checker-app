"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" // Note: Changed to client import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, QrCode, Users, FileDown, LayoutDashboard, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export default function TeacherDashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingId, setExportingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        // Verify Teacher Role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profile?.role !== "teacher") {
          router.push("/dashboard/student")
          return
        }

        // Fetch Classes
        const { data: classData, error } = await supabase
          .from("classes")
          .select("*, attendance_sessions(count)")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setClasses(classData || [])

      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  // --- THE EXCEL EXPORT FUNCTION ---
  const handleExportReport = async (classId: string, className: string) => {
    try {
      setExportingId(classId)
      toast.loading("Generating Excel Report...", { id: "export-toast" })

      // 1. Fetch Students (Enrollments)
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("student:profiles(id, full_name, email)")
        .eq("class_id", classId)
      
      // 2. Fetch Sessions
      const { data: sessions } = await supabase
        .from("attendance_sessions")
        .select("id, session_date")
        .eq("class_id", classId)
        .order("session_date", { ascending: true })

      if (!enrollments || !sessions || sessions.length === 0) {
        toast.error("No attendance data found for this class.", { id: "export-toast" })
        setExportingId(null)
        return
      }

      // 3. Fetch Logs
      const { data: logs } = await supabase
        .from("attendance_logs")
        .select("student_id, session_id, status")
        .in("session_id", sessions.map(s => s.id))

      // 4. Sort Students A-Z
      const sortedStudents = enrollments
        .map((e: any) => e.student)
        .sort((a: any, b: any) => a.full_name.localeCompare(b.full_name))

      // 5. Build Excel Data Rows
      const reportData = sortedStudents.map((student: any) => {
        const row: any = {
          "Student Name": student.full_name,
          "Email": student.email
        }

        let presentCount = 0

        sessions.forEach((session: any) => {
          const log = logs?.find(
            (l: any) => l.session_id === session.id && l.student_id === student.id
          )
          const status = log ? "Present" : "Absent"
          if (log) presentCount++
          
          row[session.session_date] = status
        })

        row["Total Present"] = presentCount
        row["Total Sessions"] = sessions.length
        row["Attendance %"] = sessions.length > 0 
          ? ((presentCount / sessions.length) * 100).toFixed(0) + "%" 
          : "0%"

        return row
      })

      // 6. Generate & Download File
      const worksheet = XLSX.utils.json_to_sheet(reportData)
      
      // Auto-width columns roughly
      const wscols = Object.keys(reportData[0] || {}).map(() => ({ wch: 15 }))
      worksheet['!cols'] = wscols

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance")
      
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" })
      
      saveAs(dataBlob, `${className}_Attendance_Report.xlsx`)

      toast.success("Download Complete!", { id: "export-toast" })

    } catch (error) {
      console.error("Export failed", error)
      toast.error("Failed to generate report", { id: "export-toast" })
    } finally {
      setExportingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500">Manage classes & export reports.</p>
          </div>
        </div>
        <Button size="lg" className="shadow-blue-200 shadow-lg bg-blue-600 hover:bg-blue-700" asChild>
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
            <div className="text-3xl font-bold text-blue-900">{classes.length}</div>
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
                {classes.map((cls) => (
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
                        {/* Link to QR Generation Page */}
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50" asChild>
                          <Link href={`/dashboard/teacher/classes/${cls.id}/qr`}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                          </Link>
                        </Button>
                        
                        {/* Direct Export Button */}
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleExportReport(cls.id, cls.name)}
                          disabled={exportingId === cls.id}
                        >
                          {exportingId === cls.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <FileDown className="mr-2 h-4 w-4" />
                          )}
                          Download Report
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {classes.length === 0 && (
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