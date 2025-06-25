"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Edit, Trash2 } from "lucide-react"
import type { TicketStatus } from "@/hooks/use-ticket-statuses"

interface SortableStatusItemProps {
  status: TicketStatus
  onEdit: (status: TicketStatus) => void
  onDelete: (status: TicketStatus) => void
}

export function SortableStatusItem({ status, onEdit, onDelete }: SortableStatusItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: status.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border border-neutral-200 hover:border-neutral-300 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 flex items-center gap-4">
        <div className={`w-4 h-4 border-2 ${status.color}`} />
        <div>
          <div className="font-medium">{status.label}</div>
          <div className="text-sm text-neutral-500">Order: {status.order}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(status)}
          className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(status)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
