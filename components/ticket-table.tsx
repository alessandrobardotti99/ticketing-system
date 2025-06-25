"use client"

import Link from "next/link"
import type { Ticket } from "@/types"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import { formatDate } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface TicketTableProps {
  tickets: Ticket[]
}

export function TicketTable({ tickets }: TicketTableProps) {
  const { getStatusLabel } = useTicketStatuses()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
      case "in-progress":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "completed":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
      case "archived":
        return "text-muted-foreground bg-muted"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <motion.div
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full bg-card">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {tickets.map((ticket, index) => (
              <motion.tr
                key={ticket.id}
                className="hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-card-foreground">{ticket.title}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">{ticket.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {ticket.assignee || "Unassigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {ticket.dueDate ? formatDate(ticket.dueDate) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
