import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Github, Linkedin, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">About the Developer</h1>
            <p className="text-blue-100">The mind behind AttendSync</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="prose prose-slate mx-auto">
              <p className="text-lg leading-relaxed text-slate-600">
                Hi, I'm <span className="font-bold text-slate-900">Andrei M. Ramos</span>.
              </p>
              
              <p className="text-slate-600">
                I am currently a <span className="font-semibold text-blue-600">3rd Year Computer Science Student</span> at the 
                <span className="font-semibold"> Technological University of the Philippines - Manila</span>.
              </p>

              <p className="text-slate-600">
                My journey in technology began at <span className="font-semibold">San Agustin National Trade School</span>, 
                where I built my foundation as an alumnus. This project, <b>AttendSync</b>, was created to solve the real-world 
                problem of manual attendance tracking using modern web technologies.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Links / Contact (Optional placeholders) */}
            <div className="flex justify-center gap-6">
              <Link href="https://github.com/dreiry" target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-blue-700 transition-colors">
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="mailto:your-email@example.com" className="text-slate-400 hover:text-red-500 transition-colors">
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-slate-400">
          © 2025 Andrei M. Ramos. All rights reserved.
        </p>
      </div>
    </div>
  )
}