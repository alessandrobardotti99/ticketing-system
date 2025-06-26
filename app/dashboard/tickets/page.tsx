"use client"

import { TicketTable } from "@/components/ticket-table"
import { TicketFilters } from "@/components/ticket-filters"
import { StatusManagement } from "@/components/status-management"
import { KanbanBoard } from "@/components/kanban-board"
import { usePermissions } from "@/hooks/use-permissions"
import { useProfile } from "@/hooks/use-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, LayoutGrid, List, Filter, Loader2, AlertCircle, TicketIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
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

export default function TicketsPage() {
  const { canCreateTickets, canManageSettings } = usePermissions()
  const { profile } = useProfile()
  
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("table")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    projectId: "",
    search: "",
  })

  // ✅ Fetch tickets dall'API
  useEffect(() => {
    if (profile) {
      fetchTickets()
    }
  }, [profile, filters])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("📡 Fetchando tickets con filtri:", filters)

      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.priority) params.append("priority", filters.priority)
      if (filters.assignee) params.append("assignee", filters.assignee)
      if (filters.projectId) params.append("projectId", filters.projectId)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`/api/tickets?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei ticket")
      }

      const data = await response.json()
      
      if (data.success) {
        setTickets(data.data)
        console.log(`✅ Caricati ${data.data.length} ticket`)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore fetch tickets:", err)
      setError(err instanceof Error ? err.message : "Errore nel caricamento")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Filtri applicati lato client per compatibilità con componenti esistenti
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = !filters.status || ticket.status === filters.status
      const matchesPriority = !filters.priority || ticket.priority === filters.priority
      const matchesAssignee = !filters.assignee || ticket.assignee === filters.assignee
      const matchesProject = !filters.projectId || ticket.projectId === filters.projectId
      const matchesSearch =
        !filters.search ||
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filters.search.toLowerCase())

      return matchesStatus && matchesPriority && matchesAssignee && matchesProject && matchesSearch
    })
  }, [tickets, filters])

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  // ✅ Handler per aggiornamento filtri
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // ✅ Refresh manuale
  const handleRefresh = () => {
    fetchTickets()
  }

  // ✅ Loading state
  if (isLoading && !error) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tickets</h1>
            <p className="text-neutral-600 mt-2">Gestisci tutti i ticket di supporto</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-neutral-600">Caricamento ticket...</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // ✅ Error state
  if (error && tickets.length === 0) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tickets</h1>
            <p className="text-neutral-600 mt-2">Gestisci tutti i ticket di supporto</p>
          </div>
        </div>
        
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Errore nel caricamento</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Riprova
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
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
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Attenzione</p>
              <p className="text-yellow-600 text-sm">
                Errore nell'aggiornamento: {error}. Mostrando dati precedenti.
              </p>
            </div>
            <button 
              onClick={handleRefresh} 
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Riprova
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-neutral-600">
              Gestisci tutti i ticket di supporto • {filteredTickets.length} ticket trovati
            </p>
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.span
                  key="filtered-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20"
                >
                  {filteredTickets.length} filtrati
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${hasActiveFilters ? "bg-primary/10 border-primary/20" : ""}`}
          >
            <Filter className="w-4 h-4" />
            Filtri
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter((v) => v !== "").length}
              </span>
            )}
          </button>
          
          {canCreateTickets() && (
            <Link href="/dashboard/create-ticket">
              <motion.div
                className="btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Nuovo Ticket
              </motion.div>
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Search */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Cerca ticket velocemente..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-neutral-500"
          />
          <AnimatePresence>
            {filters.search && (
              <motion.button
                key="clear-search"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setFilters({ ...filters, search: "" })}
                className="text-neutral-500 hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <TicketFilters filters={filters} onFiltersChange={handleFilterChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && filteredTickets.length === 0 && (
        <motion.div 
          className="card text-center py-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <TicketIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            {hasActiveFilters ? "Nessun ticket trovato" : "Nessun ticket ancora"}
          </h3>
          <p className="text-neutral-600 mb-4">
            {hasActiveFilters
              ? "Prova a modificare i filtri di ricerca"
              : "Crea il tuo primo ticket per iniziare"}
          </p>
          {canCreateTickets() && (
            <Link href="/dashboard/create-ticket">
              <motion.div
                className="btn-primary inline-flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Crea Primo Ticket
              </motion.div>
            </Link>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      {!isLoading && filteredTickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted p-1">
                <TabsTrigger value="table" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <List className="w-4 h-4" />
                  Vista Tabella
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <LayoutGrid className="w-4 h-4" />
                  Vista Kanban
                </TabsTrigger>
              </TabsList>

              {/* Status Management - Solo per admin nella vista Kanban */}
              {(canManageSettings() || profile?.role === "administrator") && activeTab === "kanban" && (
                <StatusManagement />
              )}
            </div>

            <TabsContent value="table" className="space-y-4">
              <AnimatePresence mode="wait">
                {activeTab === "table" && (
                  <motion.div
                    key="table-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TicketTable tickets={filteredTickets} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-4">
              <AnimatePresence mode="wait">
                {activeTab === "kanban" && (
                  <motion.div
                    key="kanban-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <KanbanBoard tickets={filteredTickets} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Loading overlay per refresh */}
      {isLoading && tickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-neutral-700">Aggiornamento in corso...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}