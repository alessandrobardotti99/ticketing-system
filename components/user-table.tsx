"use client"

import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Edit, Users, Search, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipi basati sulla tua API
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "administrator";
  image?: string | null;
  emailVerified: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  // Campi aggiuntivi quando si recuperano membri di un progetto
  projectRole?: string;
  joinedAt?: string;
}

interface UserWithProjects extends User {
  projects?: Array<{
    id: string;
    name: string;
    role: string;
    joinedAt: string;
    color?: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

interface UserTableProps {
  onEditUser: (user: UserWithProjects) => void
  selectedProjectId?: string // Per filtrare utenti di un progetto specifico
}

interface RoleStats {
  role: string;
  count: number;
  label: string;
}

export function UserTable({ onEditUser, selectedProjectId }: UserTableProps) {
  const { canEditUsers, canDeleteUsers } = usePermissions()
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("") // Query effettiva per l'API
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [usersWithProjects, setUsersWithProjects] = useState<UserWithProjects[]>([])
  const [availableRoles, setAvailableRoles] = useState<RoleStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ Skeleton Components
  const UserRowSkeleton = () => (
    <tr className="animate-pulse">
      {/* Avatar + Nome */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
          <div>
            <div className="h-4 bg-neutral-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-neutral-200 rounded w-16"></div>
          </div>
        </div>
      </td>
      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-neutral-200 rounded w-40 mb-1"></div>
        <div className="h-3 bg-neutral-200 rounded w-20"></div>
      </td>
      {/* Ruolo Sistema */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
      </td>
      {/* Progetti */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="h-4 bg-neutral-200 rounded w-32"></div>
          <div className="h-4 bg-neutral-200 rounded w-24"></div>
        </div>
      </td>
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
      </td>
      {/* Azioni */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-8 bg-neutral-200 rounded w-8"></div>
      </td>
    </tr>
  )

  // Funzione per recuperare gli utenti dalla tua API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (searchQuery) searchParams.set("search", searchQuery) // Usa searchQuery invece di search
      if (roleFilter !== "all") searchParams.set("role", roleFilter)
      if (selectedProjectId) searchParams.set("projectId", selectedProjectId)

      console.log("🔍 Recuperando utenti con filtri:", { search: searchQuery, roleFilter, selectedProjectId })

      const response = await fetch(`/api/users?${searchParams}`)
      const result: ApiResponse<User[]> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Errore nel recupero utenti")
      }

      if (result.success && result.data) {
        console.log(`✅ Recuperati ${result.data.length} utenti`)
        
        // ✅ Calcola ruoli disponibili dai dati effettivi
        const roleStats = calculateRoleStats(result.data)
        setAvailableRoles(roleStats)
        
        await fetchUserProjects(result.data)
      } else {
        setError(result.error || "Errore nel recupero utenti")
      }
    } catch (err) {
      console.error("❌ Errore nel fetch utenti:", err)
      setError(err instanceof Error ? err.message : "Errore di connessione")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Calcola statistiche ruoli dai dati dell'API
  const calculateRoleStats = (users: User[]): RoleStats[] => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      label: getRoleDisplayName(role)
    }))
  }

  // Recupera informazioni sui progetti per ogni utente - OTTIMIZZATO
  const fetchUserProjects = async (users: User[]) => {
    if (!users.length) {
      setUsersWithProjects([])
      return
    }

    console.log("🔄 Recuperando progetti per", users.length, "utenti...")

    try {
      // ✅ SOLUZIONE 1: Chiamata batch per tutti i progetti
      const userIds = users.map(u => u.id)
      const response = await fetch('/api/users/projects/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
      })

      if (response.ok) {
        const data: ApiResponse<Record<string, any[]>> = await response.json()
        const projectsByUser = data.success ? data.data : {}

        const usersWithProjectsData = users.map(user => ({
          ...user,
          projects: projectsByUser[user.id] || []
        }))

        setUsersWithProjects(usersWithProjectsData)
        console.log("✅ Progetti recuperati con chiamata batch")
        return
      }
    } catch (error) {
      console.warn("❌ Batch API fallita, fallback a chiamate singole:", error)
    }

    // ✅ FALLBACK: Chiamate parallele ma limitate
    console.log("🔄 Fallback: chiamate parallele con limit")
    
    // Processa in batch di 3 per evitare troppi request contemporanei
    const batchSize = 3
    const usersWithProjectsData: UserWithProjects[] = []

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async (user) => {
          try {
            const response = await fetch(`/api/users/${user.id}/projects`)
            
            if (response.ok) {
              const data: ApiResponse<any[]> = await response.json()
              return {
                ...user,
                projects: data.success ? data.data : []
              }
            } else {
              return {
                ...user,
                projects: user.projectRole ? [{
                  id: selectedProjectId || 'unknown',
                  name: 'Progetto',
                  role: user.projectRole,
                  joinedAt: user.joinedAt || new Date().toISOString(),
                }] : []
              }
            }
          } catch (error) {
            console.warn(`Errore recupero progetti per utente ${user.name}:`, error)
            return {
              ...user,
              projects: []
            }
          }
        })
      )

      usersWithProjectsData.push(...batchResults)
      
      // Pausa breve tra i batch per non sovraccaricare
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setUsersWithProjects(usersWithProjectsData)
  }

  // Effetto per recuperare utenti quando cambiano i filtri
  useEffect(() => {
    fetchUsers()
  }, [searchQuery, roleFilter, selectedProjectId]) // Usa searchQuery invece di search

  // ✅ Funzioni per gestire la ricerca
  const handleSearchSubmit = () => {
    setSearchQuery(search.trim())
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSearchSubmit()
    }
  }

  const clearSearch = () => {
    setSearch("")
    setSearchQuery("")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "administrator":
        return "bg-red-100 text-red-800 border-red-300"
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "user":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-300"
    }
  }

  const getProjectRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "admin":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "member":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-300"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "administrator":
        return "Amministratore"
      case "manager":
        return "Manager"
      case "user":
        return "Utente"
      default:
        return role
    }
  }

  // ✅ Loading state con skeleton invece di spinner
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Filtri Skeleton */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <div className="h-10 bg-neutral-200 rounded animate-pulse pl-10"></div>
              </div>
            </div>
            <div className="sm:w-48">
              <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabella Skeleton */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Utente', 'Email', 'Ruolo Sistema', 'Progetti', 'Status', 'Azioni'].map((header, i) => (
                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {[...Array(5)].map((_, i) => (
                  <UserRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Skeleton */}
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-24"></div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-16"></div>
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={fetchUsers}
            className="btn btn-primary"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Ricerca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca utenti per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="input pl-10 pr-24 w-full"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {/* Pulsante Clear */}
                {search && (
                  <button
                    onClick={clearSearch}
                    className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md hover:bg-neutral-100 transition-colors"
                    title="Cancella ricerca"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* Pulsante Search */}
                <button
                  onClick={handleSearchSubmit}
                  disabled={!search.trim()}
                  className="bg-primary text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  title="Cerca (⌘+Enter)"
                >
                  <Search className="w-3 h-3" />
                  Cerca
                </button>
              </div>
              
              {/* Hint per shortcut */}
              {search && !searchQuery && (
                <div className="absolute top-full left-0 mt-1 text-xs text-neutral-500">
                  Premi <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">⌘+Enter</kbd> per cercare
                </div>
              )}
            </div>
          </div>

          {/* ✅ Filtro Ruolo con shadcn Select */}
          <div className="sm:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <SelectValue placeholder="Seleziona ruolo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>Tutti i ruoli</span>
                    <span className="text-xs text-neutral-500 ml-2">
                      ({usersWithProjects.length})
                    </span>
                  </div>
                </SelectItem>
                {availableRoles.map((rolestat) => (
                  <SelectItem key={rolestat.role} value={rolestat.role}>
                    <div className="flex items-center justify-between w-full">
                      <span>{rolestat.label}</span>
                      <span className="text-xs text-neutral-500 ml-2">
                        ({rolestat.count})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabella */}
      <div className="card overflow-hidden">
        {usersWithProjects.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Nessun utente trovato
            </h3>
            <p className="text-neutral-600">
              {searchQuery || roleFilter !== "all" 
                ? "Prova a modificare i filtri di ricerca"
                : "Non ci sono utenti da visualizzare"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Ruolo Sistema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Progetti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  {(canEditUsers() || canDeleteUsers()) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {usersWithProjects.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    {/* Utente */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img 
                            src={user.image} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling!.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center ${user.image ? 'hidden' : ''}`}>
                          <span className="text-white font-medium text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {new Date(user.createdAt).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{user.email}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-xs text-neutral-500">
                          {user.emailVerified ? 'Verificata' : 'Non verificata'}
                        </span>
                      </div>
                    </td>

                    {/* Ruolo Sistema */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>

                    {/* Progetti */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.projects && user.projects.length > 0 ? (
                          user.projects.slice(0, 2).map((project, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-sm text-neutral-900 truncate max-w-[120px]">
                                {project.name}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${getProjectRoleColor(project.role)}`}>
                                {project.role}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-500 italic">
                            Nessun progetto
                          </span>
                        )}
                        {user.projects && user.projects.length > 2 && (
                          <div className="text-xs text-neutral-500">
                            +{user.projects.length - 2} altri
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-300">
                        Attivo
                      </span>
                    </td>

                    {/* Azioni */}
                    {(canEditUsers() || canDeleteUsers()) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                          {canEditUsers() && (
                            <button
                              onClick={() => onEditUser(user)}
                              className="text-neutral-600 hover:text-primary transition-colors flex items-center gap-1 p-1 rounded hover:bg-primary-50"
                              title="Modifica utente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Footer con statistiche dinamiche */}
        {usersWithProjects.length > 0 && (
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <div className="flex items-center gap-4">
                <span>
                  Totale: <span className="font-medium">{usersWithProjects.length}</span> utenti
                </span>
                {searchQuery && (
                  <span className="text-primary">
                    • Ricerca: "{searchQuery}"
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {availableRoles.map((rolestat) => (
                  <span key={rolestat.role}>
                    {rolestat.label}: <span className="font-medium">{rolestat.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}