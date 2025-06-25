"use client"

import { useTickets } from "@/hooks/use-tickets"
import { useUsers } from "@/hooks/use-users"
import { StatsCard } from "@/components/stats-card"
import { RecentActivity } from "@/components/recent-activity"
import { TicketChart } from "@/components/ticket-chart"

export default function DashboardPage() {
  const { tickets } = useTickets()
  const { users } = useUsers()

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === "open").length,
    inProgressTickets: tickets.filter((t) => t.status === "in-progress").length,
    completedTickets: tickets.filter((t) => t.status === "completed").length,
    totalUsers: users.length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-600 mt-2">Overview of your ticketing system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Tickets" value={stats.totalTickets} description="All tickets in system" />
        <StatsCard title="Open Tickets" value={stats.openTickets} description="Awaiting attention" />
        <StatsCard title="In Progress" value={stats.inProgressTickets} description="Currently being worked on" />
        <StatsCard title="Completed" value={stats.completedTickets} description="Successfully resolved" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketChart tickets={tickets} />
        <RecentActivity tickets={tickets} />
      </div>
    </div>
  )
}
