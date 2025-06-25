"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users con diversi ruoli
const demoUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "AU",
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@example.com",
    role: "manager",
    avatar: "MU",
  },
  {
    id: "3",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    avatar: "RU",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication
    const foundUser = demoUsers.find((u) => u.email === email)
    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
