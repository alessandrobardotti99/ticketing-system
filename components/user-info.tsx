// components/user-info.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, LogOut, ChevronUp, Shield } from "lucide-react"
import { UserProfile } from "@/hooks/use-profile"
import { getRoleDisplayName } from "@/db/schema"
import { useRouter } from "next/navigation"

interface UserInfoProps {
  profile: UserProfile
}

export function UserInfo({ profile }: UserInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Chiamata all'API di logout
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })
      
      if (response.ok) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Errore durante il logout:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "administrator": return "text-red-600 bg-red-100"
      case "manager": return "text-yellow-600 bg-yellow-100"
      case "user": return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="relative">
        <div>
          <div className="px-3 pb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">RUOLO CORRENTE</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                profile.role === "administrator" ? "bg-red-500" : 
                profile.role === "manager" ? "bg-yellow-500" : 
                "bg-green-500"
              }`}></div>
              <span className="text-sm font-medium">
                {profile.role === "administrator" ? "Amministratore" : 
                 profile.role === "manager" ? "Manager" : 
                 "Utente"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {profile.role === "administrator" ? "Accesso completo al sistema" : 
               profile.role === "manager" ? "Gestione ticket e report" : 
               "Visualizzazione e modifica ticket assegnati"}
            </div>
          </div>
        </div>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full p-2 text-sm hover:bg-accent rounded-md transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3 flex-1">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {getInitials(profile.name)}
            </div>
          )}
          <div className="flex-1 text-left">
            <div className="font-medium truncate max-w-[120px]">
              {profile.name}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
              {profile.email}
            </div>
          </div>
        </div>
        <ChevronUp
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay per chiudere cliccando fuori */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border shadow-lg rounded-md z-50 overflow-hidden"
            >
              {/* Header con info utente */}
              <div className="p-3 border-b border-border bg-muted/50">
                <div className="flex items-center gap-3">
                  
                   
                  
                  <div className="flex-1">
                    <div className="font-medium text-sm">{profile.name}</div>
                    <div className="text-xs text-muted-foreground">{profile.email}</div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(profile.role)}`}>
                      <Shield className="w-3 h-3" />
                      {getRoleDisplayName(profile.role)}
                    </div>
                  </div>
                </div>
                {profile.company && (
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span>🏢</span>
                    {profile.company}
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <motion.button
                  onClick={() => {
                    setIsOpen(false)
                    router.push("/dashboard/profile")
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <User className="w-4 h-4" />
                  Visualizza Profilo
                </motion.button>

                <motion.button
                  onClick={() => {
                    setIsOpen(false)
                    router.push("/dashboard/settings")
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <Settings className="w-4 h-4" />
                  Impostazioni
                </motion.button>

                <div className="border-t border-border my-1"></div>

                <motion.button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <LogOut className="w-4 h-4" />
                  Esci
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}