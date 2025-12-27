import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GraduationCap, ShieldCheck, QrCode, FileSpreadsheet } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1 rounded">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">AttendPro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                Smart Attendance Management
              </div>
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Modern Attendance Tracking for <span className="text-primary">Next-Gen Education</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400 leading-relaxed">
                A secure, professional, and efficient way to manage student attendance using dynamic QR codes and
                multi-factor authentication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/auth/register">Sign Up as Teacher</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
                  <Link href="/auth/register">Sign Up as Student</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border bg-slate-50/50">
                <div className="bg-primary/10 p-4 rounded-full">
                  <QrCode className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart QR Scanning</h3>
                <p className="text-slate-500">
                  Daily dynamic QR codes that students scan to mark presence instantly. No more manual roll calls.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border bg-slate-50/50">
                <div className="bg-primary/10 p-4 rounded-full">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">OTP Security</h3>
                <p className="text-slate-500">
                  Every sign-in requires an OTP verification to prevent cheating and ensure the right student is in the
                  right room.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl border bg-slate-50/50">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Professional Exports</h3>
                <p className="text-slate-500">
                  Administrators can instantly export comprehensive attendance reports in Excel format for easy grading.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 bg-slate-50">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">AttendPro University Portal</p>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 AttendPro Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
