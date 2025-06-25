"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTickets } from "@/hooks/use-tickets"
import { useUsers } from "@/hooks/use-users"
import { useProjects } from "@/hooks/use-projects"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, Ticket, Shield, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { motion } from "framer-motion"

export default function CreateTicketPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  const { createTicket } = useTickets()
  const { users } = useUsers()
  const { projects, createProject } = useProjects()
  const { canCreateTickets } = usePermissions()

  const [isLoading, setIsLoading] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "unassigned",
    projectId: projectId || "",
    dueDate: undefined as Date | undefined,
  })

  if (!canCreateTickets()) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You don't have permission to create tickets.</p>
        </div>
      </motion.div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Creiamo il ticket
      const newTicket = createTicket({
        ...formData,
        status: "open",
        dueDate: formData.dueDate?.toISOString(),
        assignee: formData.assignee === "unassigned" ? "" : formData.assignee,
        projectId: formData.projectId || undefined,
      })

      // Aspettiamo un momento per assicurarci che lo stato sia aggiornato
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Ora facciamo il redirect
      router.push(`/dashboard/tickets/${newTicket.id}`)
    } catch (error) {
      console.error("Error creating ticket:", error)
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const project = createProject({
        name: newProjectName,
        description: "",
        status: "active",
        createdBy: "Current User",
      })
      setFormData({ ...formData, projectId: project.id })
      setNewProjectName("")
      setShowNewProject(false)
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </button>
      </div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-lg">
              <Ticket className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create New Ticket</h1>
              <p className="text-muted-foreground">Create a new support ticket</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter ticket title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input resize-none"
              placeholder="Describe the issue or request..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assignee</label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => setFormData({ ...formData, assignee: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project</label>
              <div className="flex gap-2">
                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setShowNewProject(true)}
                  className="btn-secondary flex items-center gap-1 px-3"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showNewProject && (
                <motion.div
                  className="mt-3 p-3 bg-muted border border-border rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">New Project Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="input flex-1"
                      placeholder="Enter project name"
                    />
                    <button type="button" onClick={handleCreateProject} className="btn-primary px-3">
                      Create
                    </button>
                    <button type="button" onClick={() => setShowNewProject(false)} className="btn-secondary px-3">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <DatePicker
                date={formData.dueDate}
                onDateChange={(date) => setFormData({ ...formData, dueDate: date })}
                placeholder="Select due date"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? "Creating..." : "Create Ticket"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
