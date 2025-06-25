// hooks/use-profile.ts
import { useState, useEffect } from "react"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: "user" | "manager" | "administrator"
  company?: string
  emailVerified: boolean
  image?: string | null
  bio?: string
  phone?: string
  location?: string
  timezone?: string
  createdAt: Date
  updatedAt: Date
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/user/profile")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Errore nel caricamento del profilo")
      }

      if (result.success) {
        setProfile(result.data)
      } else {
        throw new Error(result.message || "Errore nel caricamento del profilo")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto"
      setError(errorMessage)
      console.error("Errore nel caricamento del profilo:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      setError(null)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Errore nell'aggiornamento del profilo")
      }

      if (result.success) {
        // Ricarica il profilo per ottenere i dati aggiornati
        await fetchProfile()
        return { success: true, message: result.message }
      } else {
        throw new Error(result.message || "Errore nell'aggiornamento del profilo")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto"
      setError(errorMessage)
      console.error("Errore nell'aggiornamento del profilo:", err)
      return { success: false, message: errorMessage }
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  }
}