"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, Download, Loader2, ArrowLeft } from "lucide-react"
import * as XLSX from "xlsx"

// FIXED: params is accessed directly (no "use()" wrapper needed for Next.js 14)
export default function ClassReportPage({ params }: { params: { id: string } }) {
  const classId = params.id
  
  const [reportData, setReportData] = useState<any[]>([])
  const [classInfo, setClassInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // 1. Get Class Info
        const { data: cls } = await supabase.from("classes").select("*").eq("id", classId).single()
        setClassInfo(cls)

        // 2. Get all students enrolled in this class
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("student_id, profiles(full_name, email)")
          .eq("class_id", classId)

        // 3. Get all sessions for this class to calculate "Total Possible Sessions"
        const { data: sessions } = await supabase
          .from("attendance_sessions")
          .select("id")
          .eq("class_id", classId)
        
        const totalSessions = sessions?.length || 0

        // 4. Get all attendance logs for this class
        // We filter logs where the session belongs to this class
        const { data: logs } = await supabase
          .from("attendance_logs")
          .select("student_id, status, session_id")
          .in("session_id", sessions?.map(s => s.id) || [])

        // 5. Build the Report Data
        const stats = enrollments?.map((enrollment: any) => {
          const studentLogs = logs?.filter(log => log.student_id === enrollment.student_id)
          const presentCount = studentLogs?.filter(log => log.status === 'present').length || 0
          const absentCount = totalSessions - presentCount
          const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

          return {
            studentName: enrollment.profiles?.full_name || "Unknown",
            email: enrollment.profiles?.email || "No Email",
            totalSessions,
            present: presentCount,
            absent: absentCount,
            percentage,
          }
        })

        setReportData(stats || [])

      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [classId])

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report")
    XLSX.writeFile(workbook, `${classInfo?.name || "Class"}_Report.xlsx`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Class
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{classInfo?.name} Report</h1>
          <p className="text-slate-500">Attendance summary for all enrolled students.</p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>
            Total Sessions Conducted: <strong>{reportData[0]?.totalSessions || 0}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-slate-700">Student Name</TableHead>
                  <TableHead className="font-bold text-slate-700">Email</TableHead>
                  <TableHead className="text-center font-bold text-slate-700">Present</TableHead>
                  <TableHead className="text-center font-bold text-slate-700">Absent</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.studentName}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{row.email}</TableCell>
                    <TableCell className="text-center text-green-600 font-medium">{row.present}</TableCell>
                    <TableCell className="text-center text-red-500">{row.absent}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        row.percentage >= 75 ? "bg-green-100 text-green-700" : 
                        row.percentage >= 50 ? "bg-yellow-100 text-yellow-700" : 
                        "bg-red-100 text-red-700"
                      }`}>
                        {row.percentage}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {reportData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No students found in this class yet.
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