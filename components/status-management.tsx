"use client"

import { useState } from "react"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import { usePermissions } from "@/hooks/use-permissions"
import { Settings, Plus, GripVertical, Edit, Trash2, ChevronDown } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CreateStatusModal } from "@/components/create-status-modal"
import { EditStatusModal } from "@/components/edit-status-modal"
import { motion, AnimatePresence } from "framer-motion"
import type { TicketStatus } from "@/hooks/use-ticket-statuses"

function SortableStatusItem({
  status,
  onEdit,
  onDelete,
}: {
  status: TicketStatus
  onEdit: (status: TicketStatus) => void
  onDelete: (status: TicketStatus) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: status.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-3 bg-muted/30 border border-border hover:border-border/80 transition-colors rounded-lg"
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 flex items-center gap-4">
        <div className={`w-4 h-4 rounded border-2 ${status.color}`} />
        <div>
          <div className="font-medium">{status.label}</div>
          <div className="text-sm text-muted-foreground">Position: {status.order}</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <motion.button
          onClick={() => onEdit(status)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-background transition-colors rounded-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <Edit className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => onDelete(status)}
          className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-colors rounded-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}

export function StatusManagement() {
  const { statuses, updateStatus, deleteStatus, reorderStatuses } = useTicketStatuses()
  const { canManageSettings } = usePermissions()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState<TicketStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (!canManageSettings()) {
    return null
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = statuses.findIndex((status) => status.id === active.id)
      const newIndex = statuses.findIndex((status) => status.id === over.id)

      const newOrder = arrayMove(statuses, oldIndex, newIndex)
      reorderStatuses(newOrder)
    }
  }

  const handleDelete = (status: TicketStatus) => {
    if (confirm(`Are you sure you want to delete the "${status.label}" status? This action cannot be undone.`)) {
      deleteStatus(status.id)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={() => setShowCreateModal(true)}
        className="btn-primary flex items-center gap-2 text-sm"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
      >
        <Plus className="w-4 h-4" />
        Add Status
      </motion.button>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="btn-secondary flex items-center gap-2 text-sm"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
      >
        <Settings className="w-4 h-4" />
        Manage
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
              className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Manage Status Columns</h3>
                      <p className="text-sm text-muted-foreground">Customize your Kanban board workflow</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-md transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={statuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {statuses.map((status) => (
                        <SortableStatusItem
                          key={status.id}
                          status={status}
                          onEdit={setEditingStatus}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {statuses.length === 0 && (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">No Custom Statuses</h4>
                    <p className="text-muted-foreground mb-4">Create your first custom status to get started</p>
                    <motion.button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-primary inline-flex items-center gap-2"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Plus className="w-4 h-4" />
                      Create Status
                    </motion.button>
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
