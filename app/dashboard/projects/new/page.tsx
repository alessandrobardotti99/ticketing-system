"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, FolderPlus, Shield, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject } = useProjects()
  const { canCreateTickets } = usePermissions()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as const,
    color: "", // Lascia vuoto per colore casuale
  })

  // ✅ Controllo permessi migliorato
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
          <p className="text-neutral-600 mt-2">
            Non hai i permessi necessari per creare progetti.
          </p>
        </div>
      </motion.div>
    )
  }

  // ✅ Gestione submit aggiornata con API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("📝 Inviando dati progetto:", formData)

      // ✅ Usa l'hook createProject che chiama l'API
      const newProject = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        color: formData.color || undefined, // Colore casuale se non specificato
      })

      console.log("✅ Progetto creato:", newProject)

      // Mostra successo
      setSuccess(true)

      // Redirect dopo un breve delay
      setTimeout(() => {
        router.push(`/dashboard/projects/${newProject.id}`)
      }, 1500)

    } catch (error) {
      console.error("❌ Errore creazione progetto:", error)
      setError(error instanceof Error ? error.message : "Errore nella creazione del progetto")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ✅ Colori predefiniti per selezione
  const colorOptions = [
    { value: "", label: "Colore Casuale", color: "bg-gradient-to-r from-blue-400 to-purple-400" },
    { value: "bg-blue-100 border-blue-300 text-blue-800", label: "Blu", color: "bg-blue-100" },
    { value: "bg-green-100 border-green-300 text-green-800", label: "Verde", color: "bg-green-100" },
    { value: "bg-purple-100 border-purple-300 text-purple-800", label: "Viola", color: "bg-purple-100" },
    { value: "bg-yellow-100 border-yellow-300 text-yellow-800", label: "Giallo", color: "bg-yellow-100" },
    { value: "bg-red-100 border-red-300 text-red-800", label: "Rosso", color: "bg-red-100" },
    { value: "bg-indigo-100 border-indigo-300 text-indigo-800", label: "Indaco", color: "bg-indigo-100" },
  ]

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
          Torna ai Progetti
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
              <FolderPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Crea Nuovo Progetto</h1>
              <p className="text-neutral-600">Organizza i tuoi ticket in un progetto</p>
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
                <p className="text-green-800 font-medium">Progetto creato con successo!</p>
                <p className="text-green-600 text-sm">Reindirizzamento in corso...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Progetto */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome Progetto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Es. Website Redesign, Mobile App, etc."
              required
              disabled={isLoading}
              maxLength={100}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.name.length}/100 caratteri
            </p>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrizione</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Descrivi il tuo progetto, obiettivi e dettagli importanti..."
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.description.length}/500 caratteri
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status Iniziale</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attivo</SelectItem>
                <SelectItem value="on-hold">In Pausa</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
                <SelectItem value="cancelled">Annullato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Colore */}
          <div>
            <label className="block text-sm font-medium mb-2">Colore Progetto</label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: option.value })}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.color === option.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className={`w-full h-8 rounded-md ${option.color} mb-2`}></div>
                  <p className="text-xs font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()} 
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creazione in corso...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Crea Progetto
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