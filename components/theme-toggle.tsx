"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ]

  const currentTheme = themes.find((t) => t.id === theme) || themes[2]

  // Durante l'idratazione, renderizza sempre il tema di sistema per evitare discrepanze
  if (!mounted) {
    return (
      <div className="relative">
        <motion.button
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.1 }}
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">System</span>
        </motion.button>
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.1 }}
      >
        <currentTheme.icon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border shadow-lg z-50 py-1 rounded-md"
            >
              {themes.map((themeOption) => (
                <motion.button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id as any)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    theme === themeOption.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  whileHover={{ x: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  <themeOption.icon className="w-4 h-4" />
                  {themeOption.label}
                  {theme === themeOption.id && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="ml-auto w-2 h-2 bg-primary rounded-full"
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}