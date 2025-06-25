"use client"

import { useState, useMemo, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { usePermissions } from "@/hooks/use-permissions"
import type { Ticket } from "@/types"

const initialTickets: Ticket[] = [
  {
    id: "1",
    title: "Fix login authentication bug",
    description:
      "Users are unable to login with their credentials. The authentication system seems to be rejecting valid login attempts.",
    status: "open",
    priority: "high",
    assignee: "John Smith",
    projectId: "1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    dueDate: "2024-01-20T00:00:00Z",
    createdBy: "Admin User",
    comments: [
      {
        id: "1",
        text: "I can reproduce this issue. Looking into the authentication middleware.",
        author: "John Smith",
        createdAt: "2024-01-15T11:00:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "Update user dashboard design",
    description:
      "Redesign the user dashboard to improve user experience and add new features requested by the product team.",
    status: "in-progress",
    priority: "medium",
    assignee: "Sarah Johnson",
    projectId: "1",
    createdAt: "2024-01-14T09:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    dueDate: "2024-01-25T00:00:00Z",
    createdBy: "Admin User",
  },
  {
    id: "3",
    title: "Database performance optimization",
    description:
      "Optimize database queries to improve application performance. Several queries are taking too long to execute.",
    status: "completed",
    priority: "high",
    assignee: "Mike Wilson",
    projectId: "3",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
    createdBy: "Admin User",
  },
  {
    id: "4",
    title: "Add email notifications",
    description: "Implement email notification system for important user actions and system events.",
    status: "open",
    priority: "low",
    assignee: "Emily Davis",
    projectId: "2",
    createdAt: "2024-01-16T13:00:00Z",
    updatedAt: "2024-01-16T13:00:00Z",
    dueDate: "2024-02-01T00:00:00Z",
    createdBy: "Manager User",
  },
  {
    id: "5",
    title: "Mobile app crash investigation",
    description:
      "Investigate and fix crashes reported in the mobile application. Users are experiencing frequent crashes on iOS devices.",
    status: "in-progress",
    priority: "high",
    assignee: "Alex Chen",
    projectId: "2",
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
    dueDate: "2024-01-22T00:00:00Z",
    createdBy: "Admin User",
  },
]

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    projectId: "",
    search: "",
  })
  const { user } = useAuth()
  const { canViewAllTickets } = usePermissions()

  const filteredTickets = useMemo(() => {
    let filtered = tickets

    // Se l'utente non può vedere tutti i ticket, mostra solo quelli assegnati a lui
    if (!canViewAllTickets() && user) {
      filtered = filtered.filter((ticket) => ticket.assignee === user.name || ticket.createdBy === user.name)
    }

    return filtered.filter((ticket) => {
      const matchesStatus = !filters.status || ticket.status === filters.status
      const matchesPriority = !filters.priority || ticket.priority === filters.priority
      const matchesAssignee = !filters.assignee || ticket.assignee === filters.assignee
      const matchesProject = !filters.projectId || ticket.projectId === filters.projectId
      const matchesSearch =
        !filters.search ||
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filters.search.toLowerCase())

      return matchesStatus && matchesPriority && matchesAssignee && matchesProject && matchesSearch
    })
  }, [tickets, filters, user, canViewAllTickets])

  const createTicket = (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.name || "Unknown",
    }

    // Aggiorniamo lo stato in modo sincrono
    setTickets((prev) => {
      const updatedTickets = [newTicket, ...prev]
      return updatedTickets
    })

    return newTicket
  }

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } : ticket,
      ),
    )
  }

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id))
  }

  const getTicketsByProject = (projectId: string) => {
    return tickets.filter((ticket) => ticket.projectId === projectId)
  }

  const getTicketById = useCallback((ticketId: string) => tickets.find((t) => t.id === ticketId), [tickets])

  return {
    tickets,
    filteredTickets,
    filters,
    setFilters,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketsByProject,
    getTicketById,
  }
}
