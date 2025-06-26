"use client"

import Link from "next/link"
import type { Ticket } from "@/types"
import { formatDate } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface TicketTableProps {
  tickets: Ticket[]
}

export function TicketTable({ tickets }: TicketTableProps) {

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400"
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente"
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Bassa"
      default:
        return priority
    }
  }

  // ✅ Nuova funzione per ottenere lo style dello status basato sul colore
  const getStatusStyle = (statusColor: string | null) => {
    if (!statusColor) {
      return {
        backgroundColor: "#f3f4f6",
        borderColor: "#d1d5db",
        color: "#6b7280"
      }
    }

    return {
      backgroundColor: `${statusColor}20`, // 20 = opacity bassa
      borderColor: statusColor,
      color: statusColor
    }
  }

  // ✅ Fallback per status senza label
  const getStatusDisplay = (ticket: any) => {
    // Se abbiamo statusLabel, usalo
    if (ticket.statusLabel) {
      return ticket.statusLabel
    }

    // Fallback per vecchi status enum
    switch (ticket.status) {
      case "open":
        return "Aperto"
      case "in-progress":
        return "In Corso"
      case "completed":
      case "resolved":
        return "Completato"
      case "closed":
        return "Chiuso"
      default:
        return ticket.status || "Sconosciuto"
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
                Titolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Priorità
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Progetto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Assegnato a
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Scadenza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Creato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Azioni
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
                  {/* ✅ Usa il nuovo sistema di status */}
                  <span 
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border"
                    style={getStatusStyle((ticket as any).statusColor)}
                  >
                    {getStatusDisplay(ticket)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {(ticket as any).project ? (
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {(ticket as any).project}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Nessun progetto</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                  {ticket.assignee || "Non assegnato"}
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
                    Visualizza
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