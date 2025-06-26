"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, Clock, User, Calendar, Flag, Edit, Save, X, Shield, MessageSquare, Loader2, AlertCircle, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

// Interfacce per il ticket
interface Comment {
  id: string
  text: string
  author: string
  createdAt: string
}

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
  comments: Comment[]
}

export default function TicketDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { canCreateTickets } = usePermissions() // Usiamo questo per ora

  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [newComment, setNewComment] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)

  // ✅ Fetch ticket dal database
  useEffect(() => {
    if (id) {
      fetchTicket()
    }
  }, [id])

  const fetchTicket = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("📡 Fetchando ticket:", id)

      const response = await fetch(`/api/tickets/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Ticket non trovato")
        } else if (response.status === 403) {
          throw new Error("Non hai i permessi per visualizzare questo ticket")
        } else {
          throw new Error("Errore nel caricamento del ticket")
        }
      }

      const data = await response.json()
      
      if (data.success) {
        setTicket(data.data)
        setEditData(data.data)
        console.log("✅ Ticket caricato:", data.data.title)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore fetch ticket:", err)
      setError(err instanceof Error ? err.message : "Errore nel caricamento")
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Salva modifiche ticket
  const handleSave = async () => {
    if (!ticket) return

    setIsSaving(true)
    try {
      console.log("💾 Salvando modifiche ticket...")

      const response = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          status: editData.status,
          priority: editData.priority,
          dueDate: editData.dueDate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nel salvataggio")
      }

      const data = await response.json()
      
      if (data.success) {
        // Ricarica il ticket per ottenere i dati aggiornati
        await fetchTicket()
        setIsEditing(false)
        console.log("✅ Ticket aggiornato con successo")
      } else {
        throw new Error(data.error || "Errore nel salvataggio")
      }

    } catch (err) {
      console.error("❌ Errore salvataggio:", err)
      setError(err instanceof Error ? err.message : "Errore nel salvataggio")
    } finally {
      setIsSaving(false)
    }
  }

  // ✅ Aggiungi commento
  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return

    setIsAddingComment(true)
    try {
      console.log("💬 Aggiungendo commento...")

      const response = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newComment.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nell'aggiunta del commento")
      }

      const data = await response.json()
      
      if (data.success) {
        // Aggiungi il nuovo commento alla lista
        setTicket(prev => prev ? {
          ...prev,
          comments: [data.data, ...prev.comments]
        } : null)
        setNewComment("")
        console.log("✅ Commento aggiunto con successo")
      } else {
        throw new Error(data.error || "Errore nell'aggiunta")
      }

    } catch (err) {
      console.error("❌ Errore commento:", err)
      setError(err instanceof Error ? err.message : "Errore nell'aggiunta del commento")
    } finally {
      setIsAddingComment(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200"
      case "high": return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-neutral-600 bg-neutral-50 border-neutral-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-blue-600 bg-blue-50 border-blue-200"
      case "in-progress": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "completed": return "text-green-600 bg-green-50 border-green-200"
      case "closed": return "text-neutral-600 bg-neutral-50 border-neutral-200"
      default: return "text-neutral-600 bg-neutral-50 border-neutral-200"
    }
  }

  // Loading state
  if (isLoading) {
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
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-neutral-600">Caricamento ticket...</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error && !ticket) {
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
          {error.includes("permessi") ? (
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          )}
          <h2 className="text-xl font-bold text-neutral-800">
            {error.includes("trovato") ? "Ticket Non Trovato" : "Errore"}
          </h2>
          <p className="text-neutral-600 mt-2">{error}</p>
          <button onClick={fetchTicket} className="btn-primary mt-4">
            Riprova
          </button>
        </div>
      </motion.div>
    )
  }

  if (!ticket) return null

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Error message se presente */}
      <AnimatePresence>
        {error && ticket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Errore</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            Torna ai Ticket
          </button>
        </div>
        {canCreateTickets() && ( // Usiamo questo permesso per ora
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salva
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false)
                    setEditData(ticket)
                    setError(null)
                  }} 
                  disabled={isSaving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annulla
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifica
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">Ticket #{ticket.id}</span>
            {ticket.project && (
              <span className="text-sm text-neutral-500">• {ticket.project}</span>
            )}
          </div>
        </div>
        {isEditing ? (
          <input
            type="text"
            value={editData.title || ""}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="input text-2xl font-bold"
            disabled={isSaving}
            maxLength={200}
          />
        ) : (
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold">Descrizione</h3>
            </div>
            {isEditing ? (
              <textarea
                value={editData.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={6}
                className="input resize-none"
                disabled={isSaving}
                maxLength={1000}
                placeholder="Descrivi il ticket..."
              />
            ) : (
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {ticket.description || "Nessuna descrizione fornita."}
                </p>
              </div>
            )}
          </motion.div>

          {/* Comments */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="card-header">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Commenti & Attività</h3>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  {ticket.comments?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment) => (
                  <motion.div 
                    key={comment.id} 
                    className="bg-neutral-50 border border-neutral-200 rounded-lg p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{comment.author}</span>
                      </div>
                      <span className="text-xs text-neutral-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{comment.text}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                  <p className="text-sm">Nessun commento ancora</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="font-medium mb-3">Aggiungi Commento</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi il tuo commento qui..."
                rows={4}
                className="input resize-none"
                disabled={isAddingComment}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-neutral-500">
                  {newComment.length}/1000 caratteri
                </p>
                <button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || isAddingComment}
                  className="btn-primary flex items-center gap-2"
                >
                  {isAddingComment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aggiungendo...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Aggiungi Commento
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold">Dettagli</h3>
            </div>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Status
                </label>
                {isEditing ? (
                  <Select
                    value={editData.status || ticket.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aperto</SelectItem>
                      <SelectItem value="in-progress">In Corso</SelectItem>
                      <SelectItem value="completed">Completato</SelectItem>
                      <SelectItem value="closed">Chiuso</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={`text-sm font-medium px-3 py-2 rounded-lg border ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("-", " ")}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Flag className="w-4 h-4" />
                  Priorità
                </label>
                {isEditing ? (
                  <Select
                    value={editData.priority || ticket.priority}
                    onValueChange={(value) => setEditData({ ...editData, priority: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Bassa
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Media
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={`text-sm font-medium px-3 py-2 rounded-lg border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Assegnato a
                </label>
                <div className="text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
                  {ticket.assignee}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  Scadenza
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : null 
                    })}
                    className="input"
                    disabled={isSaving}
                    min={new Date().toISOString().split('T')[0]}
                  />
                ) : (
                  <div className="text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
                    {ticket.dueDate ? formatDate(ticket.dueDate) : "Nessuna scadenza"}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold">Timeline</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-600">Creato:</span>
                <div className="text-neutral-800">{formatDate(ticket.createdAt)}</div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-600">Ultimo Aggiornamento:</span>
                <div className="text-neutral-800">{formatDate(ticket.updatedAt)}</div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-600">Creato da:</span>
                <div className="text-neutral-800">{ticket.createdBy}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}