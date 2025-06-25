"use client"

import type React from "react"

import { useState } from "react"
import { useUsers } from "@/hooks/use-users"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateUserModalProps {
  onClose: () => void
}

export function CreateUserModal({ onClose }: CreateUserModalProps) {
  const { createUser } = useUsers()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUser(formData)
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create New User</h2>
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
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Create User
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
