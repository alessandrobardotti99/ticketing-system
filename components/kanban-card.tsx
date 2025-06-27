import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Ticket } from "@/types"
import { Clock, User, Folder, Tag } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface KanbanCardProps {
  ticket: ExtendedTicket 
}

interface ExtendedTicket extends Ticket {
  project?: string | null
}

export function KanbanCard({ ticket }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-600"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-neutral-300"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200"
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

  const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date()
  const isDueSoon = ticket.dueDate && new Date(ticket.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-neutral-200 border-l-4 ${getPriorityColor(ticket.priority)} rounded-lg p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
    >
      {/* Badge priorità in alto a destra */}
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
          {getPriorityLabel(ticket.priority)}
        </span>
      </div>

      {/* Titolo */}
      <div className="pr-20 mb-3">
        <h4 className="font-semibold text-sm text-neutral-900 line-clamp-2 group-hover:text-neutral-700 transition-colors leading-tight">
          {ticket.title}
        </h4>
      </div>

      {/* Descrizione */}
      <p className="text-xs text-neutral-600 mb-4 line-clamp-3 leading-relaxed">
        {ticket.description}
      </p>

      {/* Sezione centrale: Progetto e Assignee affiancati */}
      <div className="space-y-3 mb-4">
        {/* Progetto */}
        {ticket.project && ticket.project !== "Nessun Progetto" && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-100">
            <Folder className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className="text-xs font-medium text-blue-700 truncate">
              {ticket.project}
            </span>
          </div>
        )}

        {/* Assignee */}
        <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-md">
          <User className="w-3 h-3 text-neutral-500 flex-shrink-0" />
          <span className="text-xs text-neutral-700 truncate font-medium">
            {ticket.assignee && ticket.assignee !== "Unassigned" ? ticket.assignee : "Non assegnato"}
          </span>
        </div>
      </div>

      {/* Footer con data scadenza e ID */}
      <div className="border-t border-neutral-100 pt-3 space-y-2">
        {/* Data scadenza */}
        {ticket.dueDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-3 h-3 flex-shrink-0 ${
                isOverdue ? "text-red-500" : isDueSoon ? "text-orange-500" : "text-neutral-400"
              }`} />
              <span className={`text-xs truncate ${
                isOverdue
                  ? "text-red-600 font-semibold" 
                  : isDueSoon
                    ? "text-orange-600 font-medium"
                    : "text-neutral-600"
              }`}>
                {formatDate(ticket.dueDate)}
              </span>
            </div>
            {isOverdue && (
              <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                Scaduto
              </span>
            )}
          </div>
        )}

        {/* ID Ticket (sempre visibile ma discreto) */}
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <Tag className="w-3 h-3 text-neutral-300 flex-shrink-0" />
          <span className="text-xs text-neutral-400 font-mono truncate">
            #{ticket.id}
          </span>
        </div>
      </div>

      {/* Indicatore urgenza per ticket scaduti */}
      {isOverdue && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-red-500"></div>
      )}
    </div>
  )
}