import type { Ticket } from "@/types"
import { formatDate } from "@/lib/utils"

interface RecentActivityProps {
  tickets: Ticket[]
}

export function RecentActivity({ tickets }: RecentActivityProps) {
  const recentTickets = tickets
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentTickets.map((ticket) => (
          <div key={ticket.id} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{ticket.title}</p>
              <p className="text-xs text-neutral-500">Updated {formatDate(ticket.updatedAt || ticket.createdAt)}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 ${
                ticket.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : ticket.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {ticket.status.replace("-", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
