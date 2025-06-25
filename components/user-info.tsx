"use client"

import { useState } from "react"
import { User, Settings, LogOut, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false)

  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
    avatar: "AU",
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
          {user.avatar}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
        <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
