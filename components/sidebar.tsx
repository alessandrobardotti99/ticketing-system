"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useProfile } from "@/hooks/use-profile"
import { hasPermission } from "@/db/schema"
import { LayoutDashboard, Ticket, Users, Settings, Clock, FolderOpen, Lock, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { UserInfo } from "./user-info"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()
  const { profile, isLoading } = useProfile()

  // Funzioni di permessi basate sui dati reali dell'utente
  const canViewUsers = () => {
    if (!profile) return false
    return hasPermission(profile.role, "canManageUsers") || hasPermission(profile.role, "canViewReports")
  }

  const canManageSettings = () => {
    if (!profile) return false
    return hasPermission(profile.role, "canManageSystem")
  }

  const canManageTime = () => {
    if (!profile) return false
    return hasPermission(profile.role, "canViewReports") || hasPermission(profile.role, "canManageSystem")
  }


  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
    { name: "Progetti", href: "/dashboard/projects", icon: FolderOpen, enabled: true },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket, enabled: true },
    { name: "Utenti", href: "/dashboard/users", icon: Users, enabled: canViewUsers() },
    { name: "Time Tracking", href: "/dashboard/time-tracking", icon: Clock, enabled: canManageTime() },
    { name: "Impostazioni", href: "/dashboard/settings", icon: Settings, enabled: canManageSettings() },
  ]

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  // Mostra loading state se i dati utente non sono ancora caricati
  if (isLoading || !profile) {
    return (
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-[17rem] bg-card border-r border-border min-h-screen shadow-sm flex flex-col"
      >
        <nav className="p-4 space-y-1 flex-1">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Caricamento...</span>
          </div>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    )
  }

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-[17rem] bg-card border-r border-border min-h-screen shadow-sm flex flex-col"
    >
       <div className="flex items-center justify-start px-4 mt-4 pb-4 border-b border-neutral-200">
                              <Image src={"/logo.svg"} alt="logo" width={130} height={130}></Image>
                          </div>
      <nav className="p-4 space-y-1 flex-1">
        {navigation.map((item, index) => {
          const isActive = isActiveRoute(item.href)
          const isDisabled = !item.enabled

          if (isDisabled) {
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: index * 0.02 }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
                title={`Accesso negato - Richiede permessi ${item.name.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
                <Lock className="w-3 h-3 ml-auto" />
              </motion.div>
            )
          }

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, delay: index * 0.02 }}
              className="relative"
            >
              
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150 relative rounded-md ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"
                  transition={{ duration: 0.15 }}
                />
              )}
            </motion.div>
          )
        })}

        {/* Sezione informativa sul ruolo */}
      
      </nav>

      {/* User Info at bottom */}
      <div className="p-4 border-t border-border">
        <UserInfo profile={profile} />
      </div>
    </motion.aside>
  )
}