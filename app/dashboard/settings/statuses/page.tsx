"use client"

import { useState } from "react"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import { usePermissions } from "@/hooks/use-permissions"
import { Plus, Palette, Shield } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableStatusItem } from "@/components/sortable-status-item"
import { CreateStatusModal } from "@/components/create-status-modal"
import { EditStatusModal } from "@/components/edit-status-modal"
import type { TicketStatus } from "@/hooks/use-ticket-statuses"

export default function StatusesPage() {
  const { statuses, updateStatus, deleteStatus, reorderStatuses } = useTicketStatuses()
  const { canManageSettings } = usePermissions()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState<TicketStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  if (!canManageSettings()) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800">Access Denied</h2>
          <p className="text-neutral-600 mt-2">You don't have permission to manage status settings.</p>
        </div>
      </div>
    )
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ticket Statuses</h1>
          <p className="text-neutral-600 mt-2">Manage and customize your ticket workflow statuses</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Status
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Status Configuration</h3>
          </div>
          <p className="text-sm text-neutral-600 mt-1">Drag and drop to reorder statuses in your Kanban board</p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={statuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {statuses.map((status) => (
                <SortableStatusItem key={status.id} status={status} onEdit={setEditingStatus} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {statuses.length === 0 && (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-neutral-800 mb-2">No Custom Statuses</h4>
            <p className="text-neutral-600 mb-4">Create your first custom status to get started</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Status
            </button>
          </div>
        )}
      </div>

      {showCreateModal && <CreateStatusModal onClose={() => setShowCreateModal(false)} />}
      {editingStatus && <EditStatusModal status={editingStatus} onClose={() => setEditingStatus(null)} />}
    </div>
  )
}
