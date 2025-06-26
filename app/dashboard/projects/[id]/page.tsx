"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, FolderOpen, Plus, Calendar, Users, Edit, Save, X, Trash2, Loader2, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

// Interfaccia aggiornata per i ticket
interface TicketData {
  id: string
  title: string
  description: string
  status: string
  statusLabel?: string // ✅ Nuovo campo
  statusColor?: string // ✅ Nuovo campo
  priority: string
  projectId: string
  assignee: string
  createdBy: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
  project: string
}

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { projects, updateProject, deleteProject } = useProjects()
  const { canEditTickets, canDeleteTickets, canCreateTickets } = usePermissions()

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [ticketsError, setTicketsError] = useState<string | null>(null)

  const project = projects.find((p) => p.id === id)

  // ✅ Fetch ticket del progetto
  useEffect(() => {
    if (project?.id) {
      fetchProjectTickets()
    }
  }, [project?.id])

  // ✅ Ricarica ticket quando si torna alla pagina (per vedere nuovi ticket creati)
  useEffect(() => {
    const handleFocus = () => {
      if (project?.id) {
        console.log("🔄 Pagina in focus, ricaricando ticket...")
        fetchProjectTickets()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [project?.id])

  const fetchProjectTickets = async () => {
    try {
      setTicketsLoading(true)
      setTicketsError(null)

      const response = await fetch(`/api/tickets?projectId=${project?.id}`)
      
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei ticket")
      }

      const data = await response.json()
      
      if (data.success) {
        setTickets(data.data)
        console.log(`✅ Caricati ${data.data.length} ticket per il progetto`)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore fetch ticket:", err)
      setTicketsError(err instanceof Error ? err.message : "Errore nel caricamento")
    } finally {
      setTicketsLoading(false)
    }
  }

  // ✅ Callback quando si naviga e si torna (per ricaricare i ticket)
  const handleTicketCreated = () => {
    fetchProjectTickets()
    console.log("✅ Ricaricando ticket dopo creazione")
  }

  // Inizializza editData quando il progetto cambia
  useEffect(() => {
    if (project) {
      setEditData(project)
    }
  }, [project])

  // ✅ Nuove funzioni per gestire status e priorità
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200"
      case "high": return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-neutral-600 bg-neutral-50 border-neutral-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente"
      case "high": return "Alta"
      case "medium": return "Media"
      case "low": return "Bassa"
      default: return priority
    }
  }

  // ✅ Nuova funzione per gestire gli status dinamici
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

  // ✅ Funzione per ottenere la label dello status
  const getStatusDisplay = (ticket: TicketData) => {
    // Se abbiamo statusLabel, usalo
    if (ticket.statusLabel) {
      return ticket.statusLabel
    }

    // Fallback per vecchi status enum
    switch (ticket.status) {
      case "open": return "Aperto"
      case "in-progress": return "In Corso"
      case "completed": return "Completato"
      case "resolved": return "Risolto"
      case "closed": return "Chiuso"
      default: return ticket.status || "Sconosciuto"
    }
  }

  // ✅ Calcola statistiche con logica migliorata
  const getStatusStats = () => {
    const stats = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      completed: 0,
      closed: 0,
    }

    tickets.forEach((ticket) => {
      // Usa statusLabel se disponibile, altrimenti status
      const statusKey = ticket.statusLabel?.toLowerCase() || ticket.status?.toLowerCase()
      
      if (statusKey?.includes('aperto') || statusKey === 'open') {
        stats.open++
      } else if (statusKey?.includes('corso') || statusKey?.includes('progress')) {
        stats.inProgress++
      } else if (statusKey?.includes('completato') || statusKey?.includes('risolto') || statusKey === 'completed' || statusKey === 'resolved') {
        stats.completed++
      } else if (statusKey?.includes('chiuso') || statusKey === 'closed') {
        stats.closed++
      }
    })

    return stats
  }

  if (!project) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800">Progetto Non Trovato</h2>
          <p className="text-neutral-600 mt-2">Il progetto che stai cercando non esiste.</p>
        </div>
      </motion.div>
    )
  }

  const handleSave = async () => {
    try {
      await updateProject(project.id, editData)
      setIsEditing(false)
    } catch (error) {
      console.error("Errore aggiornamento progetto:", error)
    }
  }

  const handleDelete = async () => {
    if (confirm("Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata.")) {
      try {
        await deleteProject(project.id)
        router.push("/dashboard/projects")
      } catch (error) {
        console.error("Errore eliminazione progetto:", error)
      }
    }
  }

  const stats = getStatusStats()

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna ai Progetti
          </button>
        </div>
        {canEditTickets() && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salva
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Annulla
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Modifica
                </button>
                {canDeleteTickets() && (
                  <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Project Info */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input text-2xl font-bold"
                />
              ) : (
                <h1 className="text-2xl font-bold">{project.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                {isEditing ? (
                  <Select
                    value={editData.status || project.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attivo</SelectItem>
                      <SelectItem value="completed">Completato</SelectItem>
                      <SelectItem value="on-hold">In Pausa</SelectItem>
                      <SelectItem value="cancelled">Annullato</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full border ${project.color}`}>
                    {project.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editData.description || ""}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
            className="input resize-none"
            placeholder="Descrizione progetto..."
          />
        ) : (
          <p className="text-neutral-700 leading-relaxed">
            {project.description || "Nessuna descrizione fornita."}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-neutral-500">Creato</p>
              <p className="font-medium">{formatDate(project.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-neutral-500">Creato da</p>
              <p className="font-medium">{project.createdBy}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-neutral-500">Ultimo Aggiornamento</p>
              <p className="font-medium">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neutral-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold">#</span>
            </div>
            <div>
              <p className="text-neutral-500">Ticket Totali</p>
              <p className="font-medium">{stats.total}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <div className="text-sm text-neutral-600">Aperti</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-neutral-600">In Corso</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-neutral-600">Completati</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-600">{stats.closed}</div>
            <div className="text-sm text-neutral-600">Chiusi</div>
          </div>
        </div>
      </motion.div>

      {/* Tickets */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ticket del Progetto</h3>
            {canCreateTickets() && (
              <Link href={`/dashboard/create-ticket?project=${project.id}`}>
                <motion.div
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Ticket
                </motion.div>
              </Link>
            )}
          </div>
        </div>

        {/* Loading State */}
        {ticketsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-neutral-600">Caricamento ticket...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {ticketsError && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-neutral-800 mb-2">Errore nel caricamento</h4>
            <p className="text-neutral-600 mb-4">{ticketsError}</p>
            <button onClick={fetchProjectTickets} className="btn-primary">
              Riprova
            </button>
          </div>
        )}

        {/* Empty State */}
        {!ticketsLoading && !ticketsError && tickets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 text-neutral-400" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-800 mb-2">Nessun Ticket</h4>
            <p className="text-neutral-600 mb-4">
              Questo progetto non ha ancora ticket.
            </p>
            {canCreateTickets() && (
              <Link href={`/dashboard/create-ticket?project=${project.id}`}>
                <motion.div
                  className="btn-primary inline-flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  Crea il Primo Ticket
                </motion.div>
              </Link>
            )}
          </div>
        )}

        {/* ✅ Tickets Table Aggiornata */}
        {!ticketsLoading && !ticketsError && tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Titolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priorità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assegnato a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Scadenza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Creato
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/dashboard/tickets/${ticket.id}`} 
                        className="hover:text-primary transition-colors"
                      >
                        <div className="text-sm font-medium text-neutral-900">{ticket.title}</div>
                        <div className="text-sm text-neutral-500 truncate max-w-xs">
                          {ticket.description || "Nessuna descrizione"}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* ✅ Usa il nuovo sistema di status */}
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border"
                        style={getStatusStyle(ticket.statusColor)}
                      >
                        {getStatusDisplay(ticket)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(ticket.priority)}`}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {ticket.assignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {ticket.dueDate ? formatDate(ticket.dueDate) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}