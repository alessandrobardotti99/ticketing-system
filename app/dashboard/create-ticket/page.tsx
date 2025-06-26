"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, Ticket, Shield, Plus, Loader2, CheckCircle, AlertCircle, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

interface TicketStatus {
  id: string
  label: string
  color: string
  order: number
}

export default function CreateTicketPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get("project")

  const { projects, createProject, isLoading: projectsLoading } = useProjects()
  const { canCreateTickets } = usePermissions()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  
  // Stati per gestione status
  const [statuses, setStatuses] = useState<TicketStatus[]>([])
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true)
  const [showCreateStatus, setShowCreateStatus] = useState(false)
  const [newStatusName, setNewStatusName] = useState("")
  const [isCreatingStatus, setIsCreatingStatus] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    projectId: projectId || "",
    statusId: "", // Nuovo campo per lo status
    dueDate: "",
  })

  // ✅ Pre-seleziona progetto se viene da query param
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setFormData(prev => ({ ...prev, projectId }))
      }
    }
  }, [projectId, projects])

  // ✅ Carica status quando cambia il progetto
  useEffect(() => {
    fetchStatuses()
  }, [formData.projectId])

  // ✅ Fetch degli status disponibili
  const fetchStatuses = async () => {
    try {
      setIsLoadingStatuses(true)
      
      const url = formData.projectId 
        ? `/api/ticket-statuses?projectId=${formData.projectId}`
        : `/api/ticket-statuses`

      console.log("📡 Fetching status:", url)

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Errore nel caricamento degli status")
      }

      const data = await response.json()
      
      if (data.success) {
        const sortedStatuses = data.data.sort((a: TicketStatus, b: TicketStatus) => a.order - b.order)
        setStatuses(sortedStatuses)
        
        // Seleziona automaticamente il primo status se disponibile
        if (sortedStatuses.length > 0 && !formData.statusId) {
          setFormData(prev => ({ ...prev, statusId: sortedStatuses[0].id }))
        }
        
        console.log(`✅ Caricati ${sortedStatuses.length} status`)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore fetch status:", err)
      // In caso di errore, non mostrare errore all'utente ma permettere creazione
      setStatuses([])
    } finally {
      setIsLoadingStatuses(false)
    }
  }

  // ✅ Crea nuovo status
  const handleCreateStatus = async () => {
    if (!newStatusName.trim()) return
    
    setIsCreatingStatus(true)
    try {
      console.log("🚀 Creando nuovo status:", newStatusName)

      const response = await fetch("/api/ticket-statuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: newStatusName.trim(),
          color: "#3b82f6", // Colore di default
          order: statuses.length,
          projectId: formData.projectId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Errore nella creazione dello status")
      }

      console.log("✅ Status creato:", data.data)
      
      // Aggiorna la lista e seleziona il nuovo status
      await fetchStatuses()
      setFormData(prev => ({ ...prev, statusId: data.data.id }))
      setNewStatusName("")
      setShowCreateStatus(false)

    } catch (error) {
      console.error("❌ Errore creazione status:", error)
      setError("Errore nella creazione dello status: " + (error instanceof Error ? error.message : "Errore sconosciuto"))
    } finally {
      setIsCreatingStatus(false)
    }
  }

  if (!canCreateTickets()) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
        </div>
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800">Accesso Negato</h2>
          <p className="text-neutral-600 mt-2">Non hai i permessi necessari per creare ticket.</p>
        </div>
      </motion.div>
    )
  }

  // ✅ Gestione submit con API (aggiornata per status)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("📝 Creando ticket:", formData)

      // Se non c'è statusId e non ci sono status, crea uno status di default
      let finalStatusId = formData.statusId
      
      if (!finalStatusId && statuses.length === 0) {
        console.log("🔄 Nessuno status disponibile, creando status di default...")
        
        const statusResponse = await fetch("/api/ticket-statuses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label: "Aperto",
            color: "#3b82f6",
            order: 0,
            projectId: formData.projectId || null,
          }),
        })

        const statusData = await statusResponse.json()
        
        if (statusResponse.ok && statusData.success) {
          finalStatusId = statusData.data.id
          console.log("✅ Status di default creato:", finalStatusId)
        }
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          projectId: formData.projectId || null,
          statusId: finalStatusId, // Usa il nuovo campo statusId
          dueDate: formData.dueDate || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nella creazione del ticket")
      }

      const data = await response.json()
      
      if (data.success) {
        console.log("✅ Ticket creato:", data.data)
        setSuccess(true)

        // Redirect dopo un breve delay
        setTimeout(() => {
          if (formData.projectId) {
            router.push(`/dashboard/projects/${formData.projectId}`)
          } else {
            router.push("/dashboard/tickets")
          }
        }, 1500)
      } else {
        throw new Error(data.error || "Errore nella creazione")
      }

    } catch (err) {
      console.error("❌ Errore creazione ticket:", err)
      setError(err instanceof Error ? err.message : "Errore nella creazione del ticket")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ✅ Crea progetto al volo con API
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    
    setIsCreatingProject(true)
    try {
      const newProject = await createProject({
        name: newProjectName.trim(),
        description: "",
        status: "active",
      })
      
      console.log("✅ Nuovo progetto creato:", newProject)
      
      // Seleziona il nuovo progetto e resetta status
      setFormData({ ...formData, projectId: newProject.id, statusId: "" })
      setNewProjectName("")
      setShowNewProject(false)
    } catch (error) {
      console.error("❌ Errore creazione progetto:", error)
      setError("Errore nella creazione del progetto")
    } finally {
      setIsCreatingProject(false)
    }
  }

  // Ottieni nome progetto selezionato
  const selectedProject = projects.find(p => p.id === formData.projectId)
  const selectedStatus = statuses.find(s => s.id === formData.statusId)

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          {formData.projectId ? "Torna al Progetto" : "Torna ai Ticket"}
        </button>
      </motion.div>

      {/* Form Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Crea Nuovo Ticket</h1>
              <p className="text-neutral-600">
                {selectedProject 
                  ? `Nel progetto: ${selectedProject.name}`
                  : "Aggiungi un nuovo ticket al sistema"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Errore nella creazione</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Ticket creato con successo!</p>
                <p className="text-green-600 text-sm">Reindirizzamento in corso...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titolo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Es. Fix bug autenticazione, Implementa nuova feature..."
              required
              disabled={isLoading}
              maxLength={200}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.title.length}/200 caratteri
            </p>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Descrizione <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Descrivi il problema, la feature richiesta o il task da completare..."
              required
              disabled={isLoading}
              maxLength={1000}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.description.length}/1000 caratteri
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priorità */}
            <div>
              <label className="block text-sm font-medium mb-2">Priorità</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                disabled={isLoading}
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
            </div>

            {/* Data Scadenza */}
            <div>
              <label className="block text-sm font-medium mb-2">Data Scadenza</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input"
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Progetto con creazione al volo */}
          <div>
            <label className="block text-sm font-medium mb-2">Progetto</label>
            <div className="flex gap-2">
              {projectsLoading ? (
                <div className="flex items-center gap-2 p-3 border border-neutral-300 rounded-lg flex-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-neutral-600">Caricamento progetti...</span>
                </div>
              ) : (
                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? "" : value, statusId: "" })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleziona progetto (opzionale)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun Progetto</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${project.color?.includes('bg-') ? project.color.split(' ')[0] : 'bg-neutral-300'}`}></div>
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <button
                type="button"
                onClick={() => setShowNewProject(true)}
                className="btn-secondary flex items-center gap-1 px-3"
                disabled={isLoading || projectsLoading}
                title="Crea nuovo progetto"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Sezione crea progetto al volo */}
            <AnimatePresence>
              {showNewProject && (
                <motion.div
                  className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">Nome Nuovo Progetto</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="input flex-1"
                      placeholder="Inserisci nome progetto"
                      disabled={isCreatingProject}
                      maxLength={100}
                    />
                    <button 
                      type="button" 
                      onClick={handleCreateProject} 
                      className="btn-primary px-3 flex items-center gap-1"
                      disabled={!newProjectName.trim() || isCreatingProject}
                    >
                      {isCreatingProject ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Crea"
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowNewProject(false)
                        setNewProjectName("")
                      }} 
                      className="btn-secondary px-3"
                      disabled={isCreatingProject}
                    >
                      Annulla
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ✅ NUOVO: Selezione Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status Iniziale</label>
            <div className="flex gap-2">
              {isLoadingStatuses ? (
                <div className="flex items-center gap-2 p-3 border border-neutral-300 rounded-lg flex-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-neutral-600">Caricamento status...</span>
                </div>
              ) : (
                <Select
                  value={formData.statusId}
                  onValueChange={(value) => setFormData({ ...formData, statusId: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleziona status (opzionale)" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nessuno status disponibile
                      </SelectItem>
                    )}
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: status.color }}
                          ></div>
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <button
                type="button"
                onClick={() => setShowCreateStatus(true)}
                className="btn-secondary flex items-center gap-1 px-3"
                disabled={isLoading || isLoadingStatuses}
                title="Crea nuovo status"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>

            {/* Sezione crea status al volo */}
            <AnimatePresence>
              {showCreateStatus && (
                <motion.div
                  className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">Nome Nuovo Status</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStatusName}
                      onChange={(e) => setNewStatusName(e.target.value)}
                      className="input flex-1"
                      placeholder="Es. Aperto, In Corso, Completato..."
                      disabled={isCreatingStatus}
                      maxLength={50}
                    />
                    <button 
                      type="button" 
                      onClick={handleCreateStatus} 
                      className="btn-primary px-3 flex items-center gap-1"
                      disabled={!newStatusName.trim() || isCreatingStatus}
                    >
                      {isCreatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Crea"
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowCreateStatus(false)
                        setNewStatusName("")
                      }} 
                      className="btn-secondary px-3"
                      disabled={isCreatingStatus}
                    >
                      Annulla
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Verrà creato uno status {formData.projectId ? "per questo progetto" : "globale"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Anteprima status selezionato */}
            {selectedStatus && (
              <div className="mt-2 text-sm text-neutral-600">
                Status selezionato: 
                <span 
                  className="ml-2 px-2 py-1 rounded text-xs font-medium border"
                  style={{ 
                    backgroundColor: `${selectedStatus.color}20`,
                    borderColor: selectedStatus.color,
                    color: selectedStatus.color 
                  }}
                >
                  {selectedStatus.label}
                </span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button 
              type="submit" 
              disabled={isLoading || !formData.title.trim() || !formData.description.trim()} 
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creazione in corso...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Crea Ticket
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="btn-secondary"
              disabled={isLoading}
            >
              Annulla
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}