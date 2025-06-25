"use client"

import { TicketTable } from "@/components/ticket-table"
import { TicketFilters } from "@/components/ticket-filters"
import { StatusManagement } from "@/components/status-management"
import { KanbanBoard } from "@/components/kanban-board"
import { useTickets } from "@/hooks/use-tickets"
import { usePermissions } from "@/hooks/use-permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, LayoutGrid, List, Filter } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function TicketsPage() {
  const { filteredTickets, filters, setFilters } = useTickets()
  const { canCreateTickets, canManageSettings } = usePermissions()
  const [activeTab, setActiveTab] = useState("table")
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Manage all support tickets</p>
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20"
                >
                  {filteredTickets.length} filtered
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
            Filters
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
                New Ticket
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
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search tickets..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
          />
          <AnimatePresence>
            {filters.search && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setFilters({ ...filters, search: "" })}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <TicketFilters filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </AnimatePresence>

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
                Table View
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2 data-[state=active]:bg-background">
                <LayoutGrid className="w-4 h-4" />
                Kanban Board
              </TabsTrigger>
            </TabsList>

            {/* Status Management - Solo per admin e solo in vista Kanban */}
            {canManageSettings() && activeTab === "kanban" && <StatusManagement />}
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="table" className="space-y-4">
              <motion.div
                key="table"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <TicketTable tickets={filteredTickets} />
              </motion.div>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-4">
              <motion.div
                key="kanban"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <KanbanBoard />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
