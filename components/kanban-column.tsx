"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import type { Ticket } from "@/types"

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  tickets: Ticket[]
}

export function KanbanColumn({ id, title, color, tickets }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg p-4 min-h-[500px] transition-colors border ${
        isOver ? "bg-muted/50 ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{tickets.length}</span>
      </div>

      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <KanbanCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </SortableContext>

      {tickets.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">No tickets in this status</div>
      )}
    </div>
  )
}
