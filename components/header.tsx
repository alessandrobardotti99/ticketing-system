"use client"

import { ThemeToggle } from "./theme-toggle"
import { LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "./auth-provider"

export function Header() {
  const { logout } = useAuth()

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-card border-b border-border px-6 py-4 shadow-none"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TF</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Index</h1>
              <p className="text-xs text-muted-foreground">Professional Ticketing System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <motion.button
            onClick={logout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 py-2 hover:bg-accent transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.1 }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
