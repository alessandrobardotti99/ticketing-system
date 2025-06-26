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
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { useProfile } from "@/hooks/use-profile"
import { motion, AnimatePresence } from "framer-motion"

// Interfaccia per i ticket
interface TicketData {
  id: string
  title: string
  description: string
  status: string
  priority: string
  projectId: string
  assignee: string
  createdBy: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
  project: string
}

// Interfaccia per gli status
interface TicketStatus {
  id: string
  label: string
  color: string
  order: number
}

interface KanbanBoardProps {
  tickets?: TicketData[]
}

export function KanbanBoard({ tickets: externalTickets }: KanbanBoardProps) {
  const { profile } = useProfile()
  
  const [tickets, setTickets] = useState<TicketData[]>(externalTickets || [])
  const [statuses, setStatuses] = useState<TicketStatus[]>([])
  const [isLoading, setIsLoading] = useState(!externalTickets)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null)
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

  // ✅ Fetch ticket se non passati tramite props
  useEffect(() => {
    if (!externalTickets && profile) {
      fetchTickets()
    }
  }, [profile, externalTickets])

  // ✅ Fetch degli status
  useEffect(() => {
    if (profile) {
      fetchStatuses()
    }
  }, [profile])

  // ✅ Aggiorna tickets quando cambiano le props
  useEffect(() => {
    if (externalTickets) {
      setTickets(externalTickets)
    }
  }, [externalTickets])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("📡 Fetchando tickets per Kanban")

      const response = await fetch("/api/tickets")
      
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei ticket")
      }

      const data = await response.json()
      
      if (data.success) {
        setTickets(data.data)
        console.log(`✅ Caricati ${data.data.length} ticket per Kanban`)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore fetch tickets Kanban:", err)
      setError(err instanceof Error ? err.message : "Errore nel caricamento")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStatuses = async () => {
    try {
      console.log("📡 Fetchando status per Kanban")

      const response = await fetch("/api/ticket-statuses")
      
      if (!response.ok) {
        throw new Error("Errore nel caricamento degli status")
      }

      const data = await response.json()
      
      if (data.success) {
        // Ordina gli status per l'ordine specificato
        const sortedStatuses = data.data.sort((a: TicketStatus, b: TicketStatus) => a.order - b.order)
        setStatuses(sortedStatuses)
        console.log(`✅ Caricati ${sortedStatuses.length} status per Kanban`)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore fetch status Kanban:", err)
      // In caso di errore, usa status di default
      setStatuses([
        { id: "open", label: "Aperto", color: "#3b82f6", order: 0 },
        { id: "in-progress", label: "In Corso", color: "#f59e0b", order: 1 },
        { id: "resolved", label: "Risolto", color: "#10b981", order: 2 },
        { id: "closed", label: "Chiuso", color: "#6b7280", order: 3 },
      ])
    }
  }

  const updateTicket = async (ticketId: string, updates: Partial<TicketData>) => {
    try {
      setIsUpdating(true)
      console.log(`📡 Aggiornando ticket ${ticketId}:`, updates)

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Errore nell'aggiornamento del ticket")
      }

      const data = await response.json()

      if (data.success) {
        // Aggiorna il ticket locale
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, ...updates } : ticket
          )
        )
        console.log(`✅ Ticket ${ticketId} aggiornato`)
      } else {
        throw new Error(data.error || "Errore nell'aggiornamento")
      }

    } catch (err) {
      console.error("❌ Errore aggiornamento ticket:", err)
      // Ripristina lo stato precedente in caso di errore
      if (externalTickets) {
        setTickets(externalTickets)
      } else {
        fetchTickets()
      }
      setError(err instanceof Error ? err.message : "Errore nell'aggiornamento")
    } finally {
      setIsUpdating(false)
    }
  }

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
      // Aggiorna immediatamente lo stato locale per feedback visivo
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: newStatusId, updatedAt: new Date().toISOString() }
            : t
        )
      )

      // Aggiorna sul server
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

  const showScrollControls = statuses.length > 4

  // ✅ Loading state
  if (isLoading) {
    return (
      <motion.div
        className="flex items-center justify-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-neutral-600">Caricamento vista Kanban...</span>
        </div>
      </motion.div>
    )
  }

  // ✅ Error state
  if (error && tickets.length === 0) {
    return (
      <motion.div
        className="card text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">Errore nel caricamento</h3>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button onClick={() => {
          if (externalTickets) {
            setTickets(externalTickets)
          } else {
            fetchTickets()
          }
          fetchStatuses()
        }} className="btn-primary">
          Riprova
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Error message se presente ma abbiamo già dei ticket */}
      <AnimatePresence>
        {error && tickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Attenzione</p>
              <p className="text-yellow-600 text-sm">
                Errore nell'aggiornamento: {error}
              </p>
            </div>
            <button 
              onClick={() => {
                setError(null)
                if (!externalTickets) fetchTickets()
              }} 
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Chiudi
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showScrollControls && (
        <motion.div 
          className="flex justify-between items-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={scrollToLeft}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={scrollToRight}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {statuses.length} colonne • Trascina lo sfondo per scorrere
          </div>
        </motion.div>
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
          <motion.div
            className="flex gap-6 pb-4"
            style={{
              width: showScrollControls ? `${statuses.length * 320}px` : "100%",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {statuses.map((status, index) => (
              <motion.div 
                key={status.id} 
                className="flex-shrink-0" 
                style={{ width: "300px" }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <KanbanColumn
                  id={status.id}
                  title={status.label}
                  color={status.color}
                  tickets={getTicketsByStatus(status.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <DragOverlay>
          {activeTicket && (
            <div className="rotate-3 opacity-90">
              <KanbanCard ticket={activeTicket} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Loading overlay per aggiornamenti */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
          >
            <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-neutral-700">Aggiornamento ticket...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}