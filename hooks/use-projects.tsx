"use client"

import { useState, useEffect, useMemo } from "react"
import { useProfile } from "@/hooks/use-profile" // ✅ Usa useProfile invece di useAuth

// Tipi per il progetto con statistiche
export interface ProjectWithStats {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold" | "cancelled"
  color: string
  createdAt: string
  updatedAt: string
  createdBy: string
  stats: {
    total: number
    open: number
    "in-progress": number
    completed: number
    closed: number
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  })
  const { profile, isLoading: profileLoading } = useProfile() // ✅ Usa useProfile

  // ✅ DEBUG: Aggiungi console.log per verificare
  console.log("🔍 useProjects DEBUG:", {
    profile,
    profileLoading,
    hasProfile: !!profile,
    profileId: profile?.id
  })

  // Fetch progetti dall'API
  const fetchProjects = async () => {
    try {
      console.log("📡 Iniziando fetch progetti...")
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)

      const url = `/api/projects?${params.toString()}`
      console.log("🌐 Chiamando API:", url)

      const response = await fetch(url)
      
      console.log("📥 Risposta API:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Errore API:", errorText)
        throw new Error(`Errore ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Dati ricevuti:", data)
      
      if (data.success) {
        setProjects(data.data)
        console.log(`✅ ${data.data.length} progetti caricati`)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }

    } catch (err) {
      console.error("❌ Errore nel fetch progetti:", err)
      setError(err instanceof Error ? err.message : "Errore nel caricamento")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch progetti quando cambiano i filtri o al mount
  useEffect(() => {
    // ✅ Attendi che il profilo sia caricato prima di fare la chiamata API
    if (!profileLoading && profile) {
      console.log("🚀 Chiamando fetchProjects...")
      fetchProjects()
    } else {
      console.log("⏳ In attesa del profilo...", { profileLoading, hasProfile: !!profile })
    }
  }, [profile, profileLoading, filters.status, filters.search])

  // Progetti filtrati lato client (per filtri aggiuntivi non supportati dall'API)
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Questi filtri sono già gestiti dall'API, ma li lasciamo per compatibilità
      const matchesStatus = !filters.status || project.status === filters.status
      const matchesSearch =
        !filters.search ||
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [projects, filters])

  // Crea un nuovo progetto
  const createProject = async (projectData: {
    name: string
    description?: string
    status?: "active" | "completed" | "on-hold" | "cancelled"
    color?: string
  }) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nella creazione del progetto")
      }

      const data = await response.json()
      
      if (data.success) {
        // Ricarica i progetti per ottenere i dati aggiornati
        await fetchProjects()
        return data.data
      } else {
        throw new Error(data.error || "Errore nella creazione")
      }

    } catch (err) {
      console.error("Errore nella creazione del progetto:", err)
      throw err
    }
  }

  // Aggiorna un progetto esistente
  const updateProject = async (id: string, updates: Partial<ProjectWithStats>) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nell'aggiornamento del progetto")
      }

      const data = await response.json()
      
      if (data.success) {
        // Aggiorna il progetto nello stato locale
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? { ...project, ...data.data } : project
          )
        )
        return data.data
      } else {
        throw new Error(data.error || "Errore nell'aggiornamento")
      }

    } catch (err) {
      console.error("Errore nell'aggiornamento del progetto:", err)
      throw err
    }
  }

  // Elimina un progetto
  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Errore nell'eliminazione del progetto")
      }

      // Rimuovi il progetto dallo stato locale
      setProjects((prev) => prev.filter((project) => project.id !== id))

    } catch (err) {
      console.error("Errore nell'eliminazione del progetto:", err)
      throw err
    }
  }

  // Trova un progetto per ID
  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id)
  }

  // Ricarica manualmente i progetti
  const refreshProjects = () => {
    return fetchProjects()
  }

  return {
    projects,
    filteredProjects,
    isLoading,
    error,
    filters,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects,
  }
}