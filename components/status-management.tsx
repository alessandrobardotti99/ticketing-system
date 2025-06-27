"use client"

declare global {
  interface Window {
    refreshKanbanStatuses?: () => void
  }
}
import { useState, useEffect, useCallback } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Settings, Plus, GripVertical, Edit, Trash2, ChevronDown, RotateCw, Type, Eye, EyeOff } from "lucide-react"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy
} from "@dnd-kit/core"
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CreateStatusModal } from "@/components/create-status-modal"
import { EditStatusModal } from "@/components/edit-status-modal"
import { motion, AnimatePresence } from "framer-motion"

// ✅ Interfaccia basata sui veri dati dall'API
interface StatusData {
  id: string
  label: string
  color: string
  order: number
  projectId: string | null
  userId: string | null
  createdAt: string
  updatedAt: string
}

// Configurazione di misurazione ottimizzata per il drag & drop
const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

// Componente per editing inline del nome
function InlineNameEditor({
  status,
  onSave,
  onCancel,
}: {
  status: StatusData
  onSave: (newLabel: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(status.label)

  const handleSave = useCallback(() => {
    if (value.trim() && value !== status.label) {
      onSave(value.trim())
    } else {
      onCancel()
    }
  }, [value, status.label, onSave, onCancel])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }, [handleSave, onCancel])

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className="bg-background border border-border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
      autoFocus
    />
  )
}

// Palette di colori predefiniti
const COLOR_PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#ec4899", // Pink
  "#6b7280", // Gray
  "#14b8a6", // Teal
  "#a855f7", // Purple
]

// Componente per color picker
function ColorPicker({
  currentColor,
  onColorChange,
}: {
  currentColor: string
  onColorChange: (color: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleColorSelect = useCallback((color: string) => {
    onColorChange(color)
    setIsOpen(false)
  }, [onColorChange])

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform touch-none"
        style={{ backgroundColor: currentColor }}
        title="Cambia colore"
      />
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-8 z-20 bg-background border border-border rounded-lg shadow-lg p-3 w-[200px]"
          >
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleColorSelect(color)
                  }}
                  className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform touch-none ${
                    currentColor === color ? "border-white shadow-md" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

// Componente status item trascinabile
function SortableStatusItem({
  status,
  onEdit,
  onDelete,
  onUpdateStatus,
  isDragOverlay = false,
}: {
  status: StatusData
  onEdit: (status: StatusData) => void
  onDelete: (status: StatusData) => void
  onUpdateStatus: (statusId: string, updates: Partial<StatusData>) => Promise<void>
  isDragOverlay?: boolean
}) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging
  } = useSortable({ 
    id: status.id,
    disabled: isDragOverlay
  })
  
  const [isEditingName, setIsEditingName] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleNameSave = useCallback(async (newLabel: string) => {
    try {
      await onUpdateStatus(status.id, { label: newLabel })
      setIsEditingName(false)
    } catch (error) {
      console.error("Errore nell'aggiornamento del nome:", error)
      setIsEditingName(false)
    }
  }, [status.id, onUpdateStatus])

  const handleColorChange = useCallback(async (newColor: string) => {
    try {
      await onUpdateStatus(status.id, { color: newColor })
    } catch (error) {
      console.error("Errore nell'aggiornamento del colore:", error)
    }
  }, [status.id, onUpdateStatus])

  const toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible)
  }, [isVisible])

  const handleExpandToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(status)
  }, [status, onDelete])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-border transition-all duration-200 rounded-lg ${
        isDragging 
          ? "bg-background shadow-xl border-primary/50 scale-105" 
          : isVisible 
            ? "bg-muted/30 hover:border-border/80" 
            : "bg-muted/10 opacity-60"
      } ${isDragOverlay ? "rotate-3 shadow-2xl" : ""}`}
    >
      {/* Main Container */}
      <div className="flex items-center gap-4 p-4 bg-white">
        {/* Drag Handle */}
        <div
          className={`cursor-grab active:cursor-grabbing transition-colors select-none touch-none ${
            isDragging 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Color Indicator */}
        <ColorPicker currentColor={status.color} onColorChange={handleColorChange} />

        {/* Status Info */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <InlineNameEditor
              status={status}
              onSave={handleNameSave}
              onCancel={() => setIsEditingName(false)}
            />
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{status.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingName(true)
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-background rounded transition-colors flex-shrink-0"
                  title="Modifica nome"
                >
                  <Type className="w-3 h-3" />
                </button>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                Posizione: {status.order} • Creato: {new Date(status.createdAt).toLocaleDateString('it-IT')}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Expand/Collapse */}
          <button
            onClick={handleExpandToggle}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-background transition-colors rounded-md"
            title="Modifica avanzate"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleVisibility()
            }}
            className={`p-2 transition-colors rounded-md ${
              isVisible 
                ? "text-muted-foreground hover:text-foreground hover:bg-background" 
                : "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
            }`}
            title={isVisible ? "Nascondi colonna" : "Mostra colonna"}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-colors rounded-md"
            title="Elimina status"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50 bg-muted/20"
          >
            <div className="p-4 space-y-4 bg-white">
              {/* Status Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground block mb-1">ID Status</label>
                  <code className="bg-background px-2 py-4 rounded text-xs font-mono block truncate border border-black">
                    {status.id}
                  </code>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Ordine</label>
                  <div className="bg-background px-2 py-4 rounded text-xs font-mono block truncate border border-black">
                    {status.order}
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Tipo</label>
                  <div className="bg-background px-2 py-4 rounded text-xs font-mono block truncate border border-black">
                    {status.projectId ? "Progetto" : status.userId ? "Utente" : "Globale"}
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Ultimo Aggiornamento</label>
                  <div className="bg-background px-2 py-4 rounded text-xs font-mono block truncate border border-black">
                    {new Date(status.updatedAt).toLocaleString('it-IT')}
                  </div>
                </div>
              </div>

              {/* Color Palette Extended */}
              <div>
                <label className="text-muted-foreground block mb-2 text-sm">Colore Colonna</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleColorChange(color)
                      }}
                      className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                        status.color === color ? "border-white shadow-md ring-2 ring-primary" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditingName(true)
                  }}
                  className="flex items-center gap-2 text-xs px-4 py-2 bg-primary text-white hover:bg-accent rounded transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Rinomina
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente principale per la gestione degli status
export function StatusManagement() {
  const { canManageSettings } = usePermissions()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState<StatusData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusList, setStatusList] = useState<StatusData[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Configurazione sensori ottimizzata
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Riduce la sensibilità per evitare attivazioni accidentali
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // ✅ Carica gli status dall'API reale
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        console.log("📡 Caricando status dall'API...")
        const response = await fetch("/api/ticket-statuses")
        
        if (!response.ok) {
          throw new Error("Errore nel caricamento degli status")
        }

        const data = await response.json()
        
        if (data.success) {
          console.log("✅ Status caricati:", data.data)
          setStatusList(data.data.sort((a: StatusData, b: StatusData) => a.order - b.order))
        } else {
          throw new Error(data.error || "Errore sconosciuto")
        }
      } catch (error) {
        console.error("❌ Errore nel caricamento status:", error)
      }
    }

    if (isExpanded) {
      fetchStatuses()
    }
  }, [isExpanded])

  // ✅ Carica gli status dall'API reale
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        console.log("📡 Caricando status dall'API...")
        const response = await fetch("/api/ticket-statuses")
        
        if (!response.ok) {
          throw new Error("Errore nel caricamento degli status")
        }

        const data = await response.json()
        
        if (data.success) {
          console.log("✅ Status caricati:", data.data)
          setStatusList(data.data.sort((a: StatusData, b: StatusData) => a.order - b.order))
        } else {
          throw new Error(data.error || "Errore sconosciuto")
        }
      } catch (error) {
        console.error("❌ Errore nel caricamento status:", error)
      }
    }

    if (isExpanded) {
      fetchStatuses()
    }
  }, [isExpanded])

  // ✅ Aggiorna singolo status via API PATCH
  const handleUpdateStatus = useCallback(async (statusId: string, updates: Partial<StatusData>) => {
    try {
      setIsUpdating(true)
      console.log(`📡 Aggiornando status ${statusId}:`, updates)

      const response = await fetch(`/api/ticket-statuses/${statusId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log(`✅ Status ${statusId} aggiornato`)
        // Aggiorna la lista locale
        setStatusList(prev => 
          prev.map(s => s.id === statusId ? { ...s, ...updates } : s)
        )
        
        // ✅ Notifica la Kanban Board dell'aggiornamento
        if (window.refreshKanbanStatuses) {
          window.refreshKanbanStatuses()
        }
        // ✅ Fallback per comunicazione cross-tab
        localStorage.setItem('kanban-status-update', Date.now().toString())
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }
    } catch (error) {
      console.error("❌ Errore aggiornamento status:", error)
      alert("Errore nell'aggiornamento dello status")
    } finally {
      setIsUpdating(false)
    }
  }, [])

  // Gestione inizio drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  // ✅ Riordina status via API PATCH
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = statusList.findIndex((status) => status.id === active.id)
    const newIndex = statusList.findIndex((status) => status.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const newOrder = arrayMove(statusList, oldIndex, newIndex)
    
    // Aggiorna immediatamente la UI
    setStatusList(newOrder)
    
    try {
      setIsUpdating(true)
      console.log("📡 Riordinando status...")

      // Prepara i dati per l'API
      const statusOrders = newOrder.map((status, index) => ({
        id: status.id,
        order: index,
      }))

      const response = await fetch("/api/ticket-statuses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statusOrders }),
      })

      if (!response.ok) {
        throw new Error(`Errore nel riordinamento: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ Status riordinati")
        
        // ✅ Notifica la Kanban Board dell'aggiornamento
        if (window.refreshKanbanStatuses) {
          window.refreshKanbanStatuses()
        }
        // ✅ Fallback per comunicazione cross-tab
        localStorage.setItem('kanban-status-update', Date.now().toString())
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }
    } catch (error) {
      console.error("❌ Errore riordinamento status:", error)
      alert("Errore nel riordinamento degli status")
      // Ripristina l'ordine originale
      setStatusList(arrayMove(newOrder, newIndex, oldIndex))
    } finally {
      setIsUpdating(false)
    }
  }, [statusList])

  // ✅ Elimina status
  const handleDelete = useCallback(async (status: StatusData) => {
    if (confirm(`Sei sicuro di voler eliminare lo status "${status.label}"? Questa azione non può essere annullata.`)) {
      try {
        setIsUpdating(true)
        console.log(`📡 Eliminando status ${status.id}`)

        const response = await fetch(`/api/ticket-statuses/${status.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Errore nell'eliminazione: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          console.log(`✅ Status ${status.id} eliminato`)
          // Rimuovi dalla lista locale
          setStatusList(prev => prev.filter(s => s.id !== status.id))
          
          // ✅ Notifica la Kanban Board dell'aggiornamento
          if (window.refreshKanbanStatuses) {
            window.refreshKanbanStatuses()
          }
          // ✅ Fallback per comunicazione cross-tab
          localStorage.setItem('kanban-status-update', Date.now().toString())
        } else {
          throw new Error(data.error || "Errore sconosciuto")
        }
      } catch (error) {
        console.error("❌ Errore eliminazione status:", error)
        alert("Errore nell'eliminazione dello status")
      } finally {
        setIsUpdating(false)
      }
    }
  }, [])

  // Status attualmente trascinato per il DragOverlay
  const activeStatus = activeId ? statusList.find(status => status.id === activeId) : null

  if (!canManageSettings()) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={() => setShowCreateModal(true)}
        className="btn-primary flex items-center gap-2 text-sm"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
        disabled={isUpdating}
      >
        <Plus className="w-4 h-4" />
        Aggiungi Status
      </motion.button>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn-secondary flex items-center gap-2 text-sm"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
        disabled={isUpdating}
      >
        <Settings className="w-4 h-4" />
        Gestisci
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              className="bg-background border border-border rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Gestisci Colonne Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Personalizza il workflow della tua board Kanban • 
                        {statusList.length} colonne configurate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUpdating && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                      />
                    )}
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto bg-bgprimary/50">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  measuring={measuring}
                >
                  <SortableContext items={statusList.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {statusList.map((status) => (
                        <SortableStatusItem
                          key={status.id}
                          status={status}
                          onEdit={setEditingStatus}
                          onDelete={handleDelete}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  {/* DragOverlay per un migliore feedback visivo */}
                  <DragOverlay>
                    {activeStatus ? (
                      <SortableStatusItem
                        status={activeStatus}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onUpdateStatus={async () => {}}
                        isDragOverlay={true}
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {statusList.length === 0 && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">Nessuno Status Personalizzato</h4>
                    <p className="text-muted-foreground mb-4">Crea il tuo primo status personalizzato per iniziare</p>
                    <motion.button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary inline-flex items-center gap-2"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Plus className="w-4 h-4" />
                      Crea Status
                    </motion.button>
                  </motion.div>
                )}

                {/* Quick Actions */}
                {statusList.length > 0 && (
                  <motion.div
                    className="mt-6 pt-6 border-t border-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <button
                        onClick={() => {
                          // Ricarica gli status dall'API
                          const fetchStatuses = async () => {
                            try {
                              const response = await fetch("/api/ticket-statuses")
                              if (response.ok) {
                                const data = await response.json()
                                if (data.success) {
                                  setStatusList(data.data.sort((a: StatusData, b: StatusData) => a.order - b.order))
                                }
                              }
                            } catch (error) {
                              console.error("Errore nel ricaricamento:", error)
                            }
                          }
                          fetchStatuses()
                        }}
                        disabled={isUpdating}
                        className="text-primary hover:text-primary/80 transition-colors bg-primary px-3 py-2 text-white flex items-center justify-center gap-2"
                      >
                        <RotateCw className="h-4 w-4" />
                        {isUpdating ? "Aggiornando..." : "Ricarica status"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && <CreateStatusModal onClose={() => setShowCreateModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {editingStatus && <EditStatusModal status={editingStatus} onClose={() => setEditingStatus(null)} />}
      </AnimatePresence>
    </div>
  )
}