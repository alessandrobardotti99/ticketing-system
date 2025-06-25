"use client"

import { useAuth } from "@/components/auth-provider"

export interface Permission {
  id: string
  name: string
  description: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

const permissions: Permission[] = [
  { id: "tickets.create", name: "Create Tickets", description: "Can create new tickets" },
  { id: "tickets.edit", name: "Edit Tickets", description: "Can edit any ticket" },
  { id: "tickets.delete", name: "Delete Tickets", description: "Can delete tickets" },
  { id: "tickets.view_all", name: "View All Tickets", description: "Can view all tickets regardless of assignment" },
  { id: "users.create", name: "Create Users", description: "Can create new users" },
  { id: "users.edit", name: "Edit Users", description: "Can edit user information" },
  { id: "users.delete", name: "Delete Users", description: "Can delete users" },
  { id: "users.view", name: "View Users", description: "Can view user list" },
  { id: "settings.manage", name: "Manage Settings", description: "Can access and modify system settings" },
  { id: "time.manage", name: "Manage Time Tracking", description: "Can manage time tracking for all users" },
]

const roles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    permissions: [
      "tickets.create",
      "tickets.edit",
      "tickets.delete",
      "tickets.view_all",
      "users.create",
      "users.edit",
      "users.delete",
      "users.view",
      "settings.manage",
      "time.manage",
    ],
  },
  {
    id: "manager",
    name: "Manager",
    permissions: ["tickets.create", "tickets.edit", "tickets.view_all", "users.view", "time.manage"],
  },
  {
    id: "user",
    name: "User",
    permissions: [],
  },
]

export function usePermissions() {
  const { user } = useAuth()

  const getUserRole = () => {
    if (!user) return null
    return roles.find((role) => role.id === user.role) || roles.find((role) => role.id === "user")
  }

  const hasPermission = (permissionId: string): boolean => {
    const role = getUserRole()
    if (!role) return false
    return role.permissions.includes(permissionId)
  }

  const canCreateTickets = () => hasPermission("tickets.create")
  const canEditTickets = () => hasPermission("tickets.edit")
  const canDeleteTickets = () => hasPermission("tickets.delete")
  const canViewAllTickets = () => hasPermission("tickets.view_all")
  const canCreateUsers = () => hasPermission("users.create")
  const canEditUsers = () => hasPermission("users.edit")
  const canDeleteUsers = () => hasPermission("users.delete")
  const canViewUsers = () => hasPermission("users.view")
  const canManageSettings = () => hasPermission("settings.manage")
  const canManageTime = () => hasPermission("time.manage")

  const canAccessTicket = (ticket: any): boolean => {
    if (canViewAllTickets()) return true
    if (!user) return false

    // L'utente può accedere se è l'assignee o il creatore
    return ticket.assignee === user.name || ticket.createdBy === user.name
  }

  const canEditTicket = (ticket: any): boolean => {
    if (canEditTickets()) return true
    if (!user) return false

    // L'utente può modificare se è l'assignee
    return ticket.assignee === user.name
  }

  return {
    permissions,
    roles,
    getUserRole,
    hasPermission,
    canCreateTickets,
    canEditTickets,
    canDeleteTickets,
    canViewAllTickets,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canViewUsers,
    canManageSettings,
    canManageTime,
    canAccessTicket,
    canEditTicket,
  }
}
