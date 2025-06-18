import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Ad-Duha Studio",
  description: "Ad-Duha Studio Management System",
}

export default function RootLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>
}
