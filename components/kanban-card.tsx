import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Ticket } from "@/types"
import { Clock, User } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface KanbanCardProps {
  ticket: Ticket
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
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-neutral-300"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-neutral-200 border-l-4 ${getPriorityColor(ticket.priority)} p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow`}
    >
      <h4 className="font-medium text-sm text-neutral-900 mb-2">{ticket.title}</h4>
      <p className="text-xs text-neutral-600 mb-3 line-clamp-2">{ticket.description}</p>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{ticket.assignee || "Unassigned"}</span>
        </div>
        {ticket.dueDate && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(ticket.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
