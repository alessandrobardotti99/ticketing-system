"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { LayoutDashboard, Ticket, Users, Settings, Clock, FolderOpen, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { UserInfo } from "./user-info"

export function Sidebar() {
  const pathname = usePathname()
  const { canViewUsers, canManageSettings, canManageTime } = usePermissions()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
    { name: "Projects", href: "/dashboard/projects", icon: FolderOpen, enabled: true },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket, enabled: true },
    { name: "Users", href: "/dashboard/users", icon: Users, enabled: canViewUsers() },
    { name: "Time Tracking", href: "/dashboard/time-tracking", icon: Clock, enabled: canManageTime() },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, enabled: canManageSettings() },
  ]

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-64 bg-card border-r border-border min-h-screen shadow-sm flex flex-col"
    >
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
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed"
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
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150 relative ${
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
                  className="absolute right-0 top-0 bottom-0 w-1 bg-primary"
                  transition={{ duration: 0.15 }}
                />
              )}
            </motion.div>
          )
        })}
      </nav>

      {/* User Info at bottom */}
      <div className="p-4 border-t border-border">
        <UserInfo />
      </div>
    </motion.aside>
  )
}
