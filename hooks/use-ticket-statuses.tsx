"use client"

import { useState, useEffect } from "react"

export interface TicketStatus {
  id: string
  label: string
  color: string
  order: number
  project?: string | null
}

const defaultStatuses: TicketStatus[] = [
  { id: "open", label: "Open", color: "#ef4444", order: 0 },
  { id: "in-progress", label: "In Progress", color: "#f59e0b", order: 1 },
  { id: "review", label: "Review", color: "#8b5cf6", order: 2 },
  { id: "done", label: "Done", color: "#10b981", order: 3 },
]

export function useTicketStatuses() {
  const [statuses, setStatuses] = useState<TicketStatus[]>(defaultStatuses)
  const [version, setVersion] = useState(0) // Forza re-render

  useEffect(() => {
    const saved = localStorage.getItem("ticket-statuses")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStatuses(parsed.sort((a: TicketStatus, b: TicketStatus) => a.order - b.order))
      } catch (error) {
        console.error("Error loading statuses:", error)
      }
    }
  }, [])

  const saveStatuses = (newStatuses: TicketStatus[]) => {
    const sortedStatuses = newStatuses.sort((a, b) => a.order - b.order)
    setStatuses(sortedStatuses)
    localStorage.setItem("ticket-statuses", JSON.stringify(sortedStatuses))
    setVersion((prev) => prev + 1) // Forza re-render di tutti i componenti che usano questo hook
  }

  const addStatus = (status: Omit<TicketStatus, "id" | "order">) => {
    const newStatus: TicketStatus = {
      ...status,
      id: `status-${Date.now()}`,
      order: statuses.length,
    }
    saveStatuses([...statuses, newStatus])
  }

  const updateStatus = (id: string, updates: Partial<TicketStatus>) => {
    const newStatuses = statuses.map((status) => (status.id === id ? { ...status, ...updates } : status))
    saveStatuses(newStatuses)
  }

  const deleteStatus = (id: string) => {
    const newStatuses = statuses.filter((status) => status.id !== id)
    // Riordina gli indici
    const reorderedStatuses = newStatuses.map((status, index) => ({
      ...status,
      order: index,
    }))
    saveStatuses(reorderedStatuses)
  }

  const reorderStatuses = (newStatuses: TicketStatus[]) => {
    const reorderedStatuses = newStatuses.map((status, index) => ({
      ...status,
      order: index,
    }))
    saveStatuses(reorderedStatuses)
  }

  const getStatusById = (id: string) => {
    return statuses.find((status) => status.id === id)
  }

  const getStatusColor = (statusId: string) => {
    const status = getStatusById(statusId)
    return status?.color || "#6b7280"
  }

  const getStatusLabel = (statusId: string) => {
    const status = getStatusById(statusId)
    return status?.label || statusId
  }

  return {
    statuses,
    addStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
    getStatusById,
    getStatusColor,
    getStatusLabel,
    version, // Esponiamo la versione per forzare re-render
  }
}
