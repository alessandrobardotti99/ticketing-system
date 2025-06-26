"use client"

import { useProfile } from "@/hooks/use-profile" // ✅ USA SOLO useProfile

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

// ✅ Ruoli corretti che corrispondono al database
const roles: Role[] = [
  {
    id: "administrator",
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
    permissions: [], // ✅ Gli utenti base NON possono creare ticket
  },
]

export function usePermissions() {
  const { profile, isLoading } = useProfile() // ✅ Usa SOLO useProfile

  console.log("🔍 usePermissions DEBUG:", {
    profile,
    isLoading,
    profileRole: profile?.role,
    rolesAvailable: roles.map(r => r.id)
  })

  const getUserRole = () => {
    if (!profile?.role) {
      console.warn("🚨 Nessun ruolo trovato nel profile")
      return null
    }
    
    const roleToCheck = profile.role
    console.log(`🔍 Cercando ruolo per: "${roleToCheck}"`)
    
    const foundRole = roles.find((role) => role.id === roleToCheck)
    
    if (!foundRole) {
      console.warn(`🚨 Ruolo "${roleToCheck}" non trovato. Ruoli disponibili:`, roles.map(r => r.id))
      // Fallback al ruolo user
      const fallbackRole = roles.find((role) => role.id === "user")
      console.log(`🔄 Usando fallback role: ${fallbackRole?.name}`)
      return fallbackRole
    }
    
    console.log(`✅ Ruolo trovato: "${foundRole.name}" con ${foundRole.permissions.length} permessi:`, foundRole.permissions)
    return foundRole
  }

  const hasPermission = (permissionId: string): boolean => {
    // Se i dati stanno caricando, restituisci false
    if (isLoading) {
      console.log(`⏳ Dati in caricamento, permesso ${permissionId} = false`)
      return false
    }

    const role = getUserRole()
    if (!role) {
      console.warn(`🚨 Nessun ruolo per controllare permesso: ${permissionId}`)
      return false
    }
    
    const hasAccess = role.permissions.includes(permissionId)
    console.log(`🔑 Controllo permesso: "${permissionId}" = ${hasAccess} (ruolo: ${role.name})`)
    return hasAccess
  }

  // ✅ Se i dati stanno caricando, restituisci funzioni che tornano false
  if (isLoading) {
    console.log("⏳ Hook usePermissions in loading state")
    return {
      permissions,
      roles,
      getUserRole: () => null,
      hasPermission: () => false,
      canCreateTickets: () => false,
      canEditTickets: () => false,
      canDeleteTickets: () => false,
      canViewAllTickets: () => false,
      canCreateUsers: () => false,
      canEditUsers: () => false,
      canDeleteUsers: () => false,
      canViewUsers: () => false,
      canManageSettings: () => false,
      canManageTime: () => false,
      canAccessTicket: () => false,
      canEditTicket: () => false,
    }
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
    if (!profile) return false

    // L'utente può accedere se è l'assignee o il creatore
    return ticket.assignee === profile.name || ticket.createdBy === profile.name
  }

  const canEditTicket = (ticket: any): boolean => {
    if (canEditTickets()) return true
    if (!profile) return false

    // L'utente può modificare se è l'assignee
    return ticket.assignee === profile.name
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