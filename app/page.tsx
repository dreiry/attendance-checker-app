import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AttendSync - QR Attendance System",
  description: "Modern attendance tracking for schools",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="py-6 text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 flex flex-col items-center gap-2">
            
            {/* The _dreined Branding */}
            <Link 
              href="/about" 
              className="font-mono text-sm font-bold tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              _dreined
            </Link>

            {/* Optional Small Text */}
            <p className="text-[10px] text-slate-300 uppercase tracking-wider">
              Designed by Andrei Ramos
            </p>
          </div>
        </footer>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}