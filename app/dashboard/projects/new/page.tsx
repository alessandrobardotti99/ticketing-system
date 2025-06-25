"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, FolderPlus, Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject } = useProjects()
  const { canCreateTickets } = usePermissions()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as const,
  })

  if (!canCreateTickets()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800">Access Denied</h2>
          <p className="text-neutral-600 mt-2">You don't have permission to create projects.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const project = createProject({
        ...formData,
        createdBy: "Current User", // In a real app, this would come from auth
      })
      router.push(`/dashboard/projects/${project.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create New Project</h1>
              <p className="text-neutral-600">Organize your tickets into a project</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? "Creating..." : "Create Project"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
