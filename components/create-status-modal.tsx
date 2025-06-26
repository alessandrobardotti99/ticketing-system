"use client"

import type React from "react"
import { useState } from "react"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import { X, Palette, Loader2 } from "lucide-react"

interface CreateStatusModalProps {
  onClose: () => void
  projectId?: string // Per status di progetto
}

const colorPresets = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Neutral", value: "#6b7280" },
  { name: "Slate", value: "#64748b" },
]

export function CreateStatusModal({ onClose, projectId }: CreateStatusModalProps) {
  const ticketStatuses = useTicketStatuses(projectId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [formData, setFormData] = useState({
    label: "",
    color: colorPresets[0].value,
    customColor: "",
    order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("🚀 Creazione nuovo status:", { ...formData, projectId })

      const response = await fetch("/api/ticket-statuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: formData.label.trim(),
          color: useCustomColor ? formData.customColor : formData.color,
          order: formData.order,
          projectId: projectId || null, // null per status globali
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore nella creazione dello status")
      }

      if (!data.success) {
        throw new Error(data.error || "Errore nella creazione dello status")
      }

      console.log("✅ Status creato con successo:", data.data)

      // Aggiorna la lista degli status se la funzione esiste
      if (ticketStatuses?.refetch) {
        await ticketStatuses.refetch()
      }
      
      // Chiudi il modal
      onClose()

    } catch (error) {
      console.error("❌ Errore nella creazione dello status:", error)
      setError(error instanceof Error ? error.message : "Errore sconosciuto")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "order" ? parseInt(value) || 0 : value 
    }))
  }

  // Funzione per ottenere le classi CSS basate sul colore hex
  const getColorPreview = (color: string) => {
    // Se il colore è vuoto, usa un colore di default
    if (!color) {
      color = "#6b7280"
    }
    
    // Se il colore inizia con #, è un hex
    if (color.startsWith("#")) {
      return {
        backgroundColor: `${color}20`, // 20 = opacity bassa per background
        borderColor: color,
        color: color,
      }
    }
    
    // Altrimenti prova ad usarlo come nome CSS
    return {
      backgroundColor: color,
      borderColor: color,
      color: "white",
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <h2 className="text-xl font-bold">
              Crea Nuovo Status {projectId ? "di Progetto" : "Globale"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome Status <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="es. In Revisione, Test, Bloccato"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ordine</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              disabled={loading}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Ordine di visualizzazione (0 = primo)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colore</label>
            
            {/* Toggle per scegliere tra preset e personalizzato */}
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!useCustomColor}
                  onChange={() => setUseCustomColor(false)}
                  disabled={loading}
                />
                <span className="text-sm">Colori predefiniti</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useCustomColor}
                  onChange={() => setUseCustomColor(true)}
                  disabled={loading}
                />
                <span className="text-sm">Colore personalizzato</span>
              </label>
            </div>

            {/* Colori predefiniti */}
            {!useCustomColor && (
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: preset.value }))}
                    disabled={loading}
                    className={`p-3 text-xs border-2 rounded-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      formData.color === preset.value 
                        ? "ring-2 ring-blue-500 ring-offset-1" 
                        : "hover:border-neutral-400"
                    }`}
                    style={getColorPreview(preset.value)}
                    title={preset.name}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
            
            {/* Input colore personalizzato */}
            {useCustomColor && (
              <div>
                <input
                  type="text"
                  name="customColor"
                  value={formData.customColor}
                  onChange={handleChange}
                  placeholder="#3b82f6 o blue-500"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Inserisci un codice colore hex (es. #3b82f6) o nome colore CSS
                </p>
              </div>
            )}
          </div>

          <div className="border border-neutral-200 p-3 rounded-md bg-neutral-50">
            <p className="text-sm font-medium mb-2">Anteprima:</p>
            <div
              className="inline-block px-3 py-1 text-sm font-medium border rounded-md"
              style={getColorPreview(useCustomColor ? formData.customColor : formData.color)}
            >
              {formData.label || "Anteprima Status"}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading || !formData.label.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creazione..." : "Crea Status"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 disabled:opacity-50"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}