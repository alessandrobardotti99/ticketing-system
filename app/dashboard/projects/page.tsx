"use client"

import { useState } from "react"
import { useProjects } from "@/hooks/use-projects"
import { useAuthorizedProjects } from "@/hooks/use-authorized-projects"
import { usePermissions } from "@/hooks/use-permissions"
import { Plus, FolderOpen, Calendar, Users, MoreHorizontal, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function ProjectsPage() {
  const { 
    filteredProjects, 
    isLoading, 
    error, 
    filters, 
    setFilters,
    refreshProjects 
  } = useProjects()
  
  // Hook per verificare i progetti autorizzati
  // Aggiungi un controllo di sicurezza per evitare array undefined
  const safeFilteredProjects = filteredProjects || []
  console.log('🔍 ProjectsPage: filteredProjects from useProjects:', safeFilteredProjects.length, safeFilteredProjects.map(p => p.name))
  
  const { authorizedIds, loading: authLoading } = useAuthorizedProjects(safeFilteredProjects)
  
  console.log('🎯 ProjectsPage: authorizedIds from hook:', authorizedIds, 'authLoading:', authLoading)
  
  const { canCreateTickets } = usePermissions()
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value === "all" ? "" : value })
  }

  // Filtra i progetti per mostrare solo quelli autorizzati
  const authorizedProjects = safeFilteredProjects.filter(project => 
    authorizedIds.includes(project.id)
  )
  
  console.log('🏁 ProjectsPage: Final authorizedProjects to display:', authorizedProjects.length, authorizedProjects.map(p => p.name))

  // Skeleton Component
  const ProjectSkeleton = () => (
    <div className="card">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-lg"></div>
            <div>
              <div className="h-5 bg-neutral-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-2 bg-neutral-200 rounded w-full"></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 bg-neutral-200 rounded"></div>
            <div className="h-8 bg-neutral-200 rounded"></div>
            <div className="h-8 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )

  // Loading state - include anche il caricamento delle autorizzazioni
  if (isLoading || authLoading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-neutral-600 mt-2">Organize your work into projects</p>
          </div>
          <div className="h-10 bg-neutral-200 rounded animate-pulse w-32"></div>
        </div>

        {/* Search Skeleton */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 bg-neutral-200 rounded animate-pulse"></div>
            <div className="flex-1 h-5 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-8 bg-neutral-200 rounded animate-pulse w-20"></div>
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-neutral-600 mt-2">Organize your work into projects</p>
          </div>
        </div>
        
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Errore nel caricamento</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button 
            onClick={refreshProjects}
            className="btn-primary"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-neutral-600 mt-2">
            Organize your work into projects • {authorizedProjects.length} progetti autorizzati
          </p>
        </div>
        {canCreateTickets() && (
          <Link href="/dashboard/projects/new">
            <motion.div
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              New Project
            </motion.div>
          </Link>
        )}
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Quick Search */}
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca progetti..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
              showFilters ? "bg-primary/10 text-primary" : "text-neutral-600 hover:text-neutral-800"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtri
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select 
                      value={filters.status || "all"} 
                      onValueChange={(value) => handleFilterChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutti i Status</SelectItem>
                        <SelectItem value="active">Attivo</SelectItem>
                        <SelectItem value="completed">Completato</SelectItem>
                        <SelectItem value="on-hold">In Pausa</SelectItem>
                        <SelectItem value="cancelled">Annullato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Projects Grid */}
      <AnimatePresence>
        {authorizedProjects.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {authorizedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link href={`/dashboard/projects/${project.id}`}>
                  <div className="card hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FolderOpen className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${project.color}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          // TODO: Aggiungi menu opzioni
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                      {project.description || "Nessuna descrizione disponibile"}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Total Tickets</span>
                        <span className="font-medium">{project.stats.total}</span>
                      </div>

                      {/* Progress bar */}
                      {project.stats.total > 0 && (
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(project.stats.completed / project.stats.total) * 100}%` 
                            }}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{project.stats.open}</div>
                          <div className="text-neutral-500">Open</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">{project.stats["in-progress"]}</div>
                          <div className="text-neutral-500">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{project.stats.completed}</div>
                          <div className="text-neutral-500">Completed</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(project.updatedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.createdBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="card text-center py-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <FolderOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              {filteredProjects.length === 0 
                ? "Nessun progetto trovato" 
                : "Nessun progetto autorizzato"
              }
            </h3>
            <p className="text-neutral-600 mb-4">
              {filteredProjects.length === 0 
                ? (filters.search || filters.status
                    ? "Prova a modificare i filtri di ricerca"
                    : "Crea il tuo primo progetto per iniziare")
                : "Non hai accesso ai progetti disponibili"
              }
            </p>
            {canCreateTickets() && filteredProjects.length === 0 && (
              <Link href="/dashboard/projects/new">
                <motion.div
                  className="btn-primary inline-flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  Crea Progetto
                </motion.div>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}