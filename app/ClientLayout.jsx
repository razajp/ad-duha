"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ToastProvider } from "../components/providers/ToastProvider"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }) {
  const pathname = usePathname()

  const isActive = (path) => {
    if (path === "/" && pathname === "/") return true
    if (path === "/appointments/new" && pathname === "/appointments/new") return true
    if (path === "/monthly-clients/new" && pathname === "/monthly-clients/new") return true
    if (path === "/accounts/new" && pathname === "/accounts/new") return true
    if (path === "/accounts/withdraw" && pathname === "/accounts/withdraw") return true
    if (
      path !== "/" &&
      path !== "/appointments/new" &&
      path !== "/monthly-clients/new" &&
      path !== "/accounts/new" &&
      path !== "/accounts/withdraw" &&
      pathname.startsWith(path)
    )
      return true
    return false
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-screen bg-gray-900 flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 flex flex-col">
            {/* Logo Section */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Image src="/ad-duha-logo.jpg" alt="Ad-Duha Logo" width={32} height={32} className="rounded-md" />
                <div>
                  <h1 className="text-white text-sm font-bold">Ad-Duha Studio</h1>
                  <p className="text-gray-400 text-xs">Management System</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-2">
              <nav className="space-y-1">
                <Link href="/">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive("/") ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Home
                  </div>
                </Link>
                <Link href="/appointments/new">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive("/appointments/new") ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    New Appointment
                  </div>
                </Link>
                <Link href="/appointments">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      pathname === "/appointments" ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    All Appointments
                  </div>
                </Link>
                <Link href="/monthly-clients/new">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive("/monthly-clients/new") ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    New Monthly Client
                  </div>
                </Link>
                <Link href="/monthly-clients">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      pathname === "/monthly-clients" ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Monthly Clients
                  </div>
                </Link>
                <Link href="/accounts/new">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive("/accounts/new") ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    New Account
                  </div>
                </Link>
                <Link href="/accounts/withdraw">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      isActive("/accounts/withdraw") ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Withdraw Money
                  </div>
                </Link>
                <Link href="/accounts">
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      pathname === "/accounts" ? "bg-[#683223] text-white" : "text-gray-400 hover:bg-gray-800"
                    }`}
                  >
                    Account Balances
                  </div>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <ToastProvider>
              {children}
            </ToastProvider>
          </div>
        </div>

        {/* CSS for hiding scrollbar */}
        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </body>
    </html>
  )
}
