"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
} from "@dnd-kit/core"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { useTickets } from "@/hooks/use-tickets"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import type { Ticket } from "@/types"

export function KanbanBoard() {
  const { tickets, updateTicket } = useTickets()
  const { statuses, version } = useTicketStatuses()
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [isDraggingScroll, setIsDraggingScroll] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id)
    setActiveTicket(ticket || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Gestione drag over se necessaria
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)
    if (!over) return

    const ticketId = active.id as string
    const newStatusId = over.id as string

    const validStatus = statuses.find((s) => s.id === newStatusId)
    if (!validStatus) return

    const ticket = tickets.find((t) => t.id === ticketId)
    if (ticket && ticket.status !== newStatusId) {
      updateTicket(ticketId, {
        status: newStatusId,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const getTicketsByStatus = (statusId: string) => tickets.filter((t) => t.status === statusId)

  // Scroll handlers - solo per il container, non per i ticket
  const handleMouseDown = (e: React.MouseEvent) => {
    // Non attivare scroll se stiamo cliccando su un ticket
    const target = e.target as HTMLElement
    if (target.closest("[data-ticket-id]")) return

    if (!scrollContainerRef.current) return
    setIsDraggingScroll(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingScroll || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDraggingScroll(false)
  }

  const scrollToLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollToRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  // Re-render quando cambiano gli status
  useEffect(() => {
    // Questo effect si attiva quando version cambia
  }, [version])

  const showScrollControls = statuses.length > 4

  return (
    <div className="relative">
      {showScrollControls && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={scrollToLeft}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={scrollToRight}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">{statuses.length} columns • Drag background to scroll</div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent ${
            isDraggingScroll ? "cursor-grabbing" : showScrollControls ? "cursor-grab" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "hsl(var(--muted)) transparent",
          }}
        >
          <div
            className="flex gap-6 pb-4"
            style={{
              width: showScrollControls ? `${statuses.length * 320}px` : "100%",
            }}
          >
            {statuses.map((status) => (
              <div key={`${status.id}-${version}`} className="flex-shrink-0" style={{ width: "300px" }}>
                <KanbanColumn
                  id={status.id}
                  title={status.label}
                  color={status.color}
                  tickets={getTicketsByStatus(status.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTicket && (
            <div className="rotate-3 opacity-90">
              <KanbanCard ticket={activeTicket} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
