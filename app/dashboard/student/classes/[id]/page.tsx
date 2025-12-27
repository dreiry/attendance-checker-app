"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"

export default function ClassHistoryPage({ params }: { params: { id: string } }) {
  const classId = params.id
  const [logs, setLogs] = useState<any[]>([])
  const [className, setClassName] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get Class Name
      const { data: cls } = await supabase.from("classes").select("name").eq("id", classId).single()
      if (cls) setClassName(cls.name)

      // Get Attendance Logs
      const { data } = await supabase
        .from("attendance_logs")
        .select(`
          status, 
          marked_at, 
          attendance_sessions ( session_date )
        `)
        .eq("student_id", user.id)
        .order("marked_at", { ascending: false })

      setLogs(data || [])
      setLoading(false)
    }
    fetchHistory()
  }, [classId])

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{className} - My History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {new Date(log.attendance_sessions?.session_date || log.marked_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(log.marked_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center text-green-600 font-medium text-sm">
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Present
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No attendance records yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}