import type { Ticket } from "@/types"

interface TicketChartProps {
  tickets: Ticket[]
}

export function TicketChart({ tickets }: TicketChartProps) {
  const statusCounts = {
    open: tickets.filter((t) => t.status === "open").length,
    "in-progress": tickets.filter((t) => t.status === "in-progress").length,
    completed: tickets.filter((t) => t.status === "completed").length,
    archived: tickets.filter((t) => t.status === "archived").length,
  }

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  const getPercentage = (count: number) => (total > 0 ? (count / total) * 100 : 0)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Ticket Distribution</h3>
      <div className="space-y-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize font-medium">{status.replace("-", " ")}</span>
              <span className="text-neutral-600">
                {count} ({getPercentage(count).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-2">
              <div
                className={`h-2 ${
                  status === "open"
                    ? "bg-blue-500"
                    : status === "in-progress"
                      ? "bg-yellow-500"
                      : status === "completed"
                        ? "bg-green-500"
                        : "bg-neutral-400"
                }`}
                style={{ width: `${getPercentage(count)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
