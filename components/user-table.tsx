"use client"

import { useState, useEffect } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Edit, Users, Search, Filter } from "lucide-react"

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

export function UserTable({ onEditUser, selectedProjectId }: UserTableProps) {
  const { canEditUsers, canDeleteUsers } = usePermissions()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [usersWithProjects, setUsersWithProjects] = useState<UserWithProjects[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Funzione per recuperare gli utenti dalla tua API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (search) searchParams.set("search", search)
      if (roleFilter !== "all") searchParams.set("role", roleFilter)
      if (selectedProjectId) searchParams.set("projectId", selectedProjectId)

      console.log("🔍 Recuperando utenti con filtri:", { search, roleFilter, selectedProjectId })

      const response = await fetch(`/api/users?${searchParams}`)
      const result: ApiResponse<User[]> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Errore nel recupero utenti")
      }

      if (result.success && result.data) {
        console.log(`✅ Recuperati ${result.data.length} utenti`)
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

  // Recupera informazioni sui progetti per ogni utente
  const fetchUserProjects = async (users: User[]) => {
    if (!users.length) {
      setUsersWithProjects([])
      return
    }

    console.log("🔄 Recuperando progetti per", users.length, "utenti...")

    const usersWithProjectsData = await Promise.all(
      users.map(async (user) => {
        try {
          // Recupera i progetti dell'utente tramite projectMember
          const response = await fetch(`/api/users/${user.id}/projects`)
          
          if (response.ok) {
            const data: ApiResponse<any[]> = await response.json()
            return {
              ...user,
              projects: data.success ? data.data : []
            }
          } else {
            // Fallback: se non esiste l'endpoint, usiamo i dati base
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

    setUsersWithProjects(usersWithProjectsData)
  }

  // Effetto per recuperare utenti quando cambiano i filtri
  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, selectedProjectId])

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

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-neutral-600">Caricamento utenti...</span>
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
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Filtro Ruolo */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input pl-10 w-full appearance-none bg-white"
              >
                <option value="all">Tutti i ruoli</option>
                <option value="administrator">Amministratore</option>
                <option value="manager">Manager</option>
                <option value="user">Utente</option>
              </select>
            </div>
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
              {search || roleFilter !== "all" 
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
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
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
                              className="text-neutral-600 hover:text-blue-600 transition-colors flex items-center gap-1 p-1 rounded hover:bg-blue-50"
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

        {/* Footer con statistiche */}
        {usersWithProjects.length > 0 && (
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <div>
                Totale: <span className="font-medium">{usersWithProjects.length}</span> utenti
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Admin: <span className="font-medium">
                    {usersWithProjects.filter(u => u.role === 'administrator').length}
                  </span>
                </span>
                <span>
                  Manager: <span className="font-medium">
                    {usersWithProjects.filter(u => u.role === 'manager').length}
                  </span>
                </span>
                <span>
                  Utenti: <span className="font-medium">
                    {usersWithProjects.filter(u => u.role === 'user').length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}