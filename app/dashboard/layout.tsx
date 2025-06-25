import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bgprimary/50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
