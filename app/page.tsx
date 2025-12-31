import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white flex flex-col">
      
      {/* Navbar Placeholder (keeps things aligned) */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="font-bold text-xl tracking-tighter">AttendSync</div>
        <Link href="/auth/login" className="text-sm font-medium hover:text-blue-300 transition-colors">
          Sign In
        </Link>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-24">
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
            Live Attendance Tracking
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Attendance made <br className="hidden md:block" />
            <span className="text-blue-400">effortless.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Forget paper sheets. Generate a QR code, let students scan it, 
            and get real-time reports in seconds.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 border-0 shadow-lg shadow-blue-900/20 rounded-full">
              <Link href="/auth/login">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-700 bg-transparent text-white hover:bg-slate-800 hover:text-white">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 opacity-80">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <QrCode className="h-5 w-5 text-blue-400" />
              <span>Instant QR Scan</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              <span>Secure Records</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}