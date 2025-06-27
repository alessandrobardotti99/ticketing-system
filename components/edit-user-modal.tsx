"use client"

import { useState, useEffect } from "react"
import { useUsers } from "@/hooks/use-users"
import { usePermissions } from "@/hooks/use-permissions"
import { X, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User } from "@/types"

interface EditUserModalProps {
  user: User
  onClose: () => void
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const { updateUser, deleteUser } = useUsers()
  const { canEditUsers, canDeleteUsers } = usePermissions()
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  })

  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch("/api/projects")
      const json = await res.json()
      if (json.success) {
        setProjects(json.data)
      }
    }
    fetchProjects()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canEditUsers()) {
      updateUser(user.id, formData)
      onClose()
    }
  }

  const handleDelete = () => {
    if (canDeleteUsers() && confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUser(user.id)
      onClose()
    }
  }

  const handleInvite = async () => {
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, projectId: selectedProject }),
      })
      const result = await res.json()
      if (result.success) {
        setInviteStatus("Invito inviato con successo")
      } else {
        setInviteStatus(result.message || "Errore durante l'invio")
      }
    } catch (err) {
      console.error(err)
      setInviteStatus("Errore di rete")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (!canEditUsers()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Access Denied</h2>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-neutral-600">You don't have permission to edit users.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit User</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6">
            <h3 className="text-sm font-semibold mb-2">Invita utente a un progetto</h3>
            <Select value={selectedProject} onValueChange={(value) => setSelectedProject(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un progetto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleInvite}
              className="btn-primary w-full mt-2"
            >
              Invia invito
            </button>
            {inviteStatus && <p className="text-sm text-neutral-600 mt-2">{inviteStatus}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Update User
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            {canDeleteUsers() && (
              <button type="button" onClick={handleDelete} className="btn-danger flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}