"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
import { useTickets } from "@/hooks/use-tickets"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, FolderOpen, Plus, Calendar, Users, Edit, Save, X, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { projects, updateProject, deleteProject } = useProjects()
  const { getTicketsByProject } = useTickets()
  const { canEditTickets, canDeleteTickets } = usePermissions()

  const project = projects.find((p) => p.id === id)
  const tickets = getTicketsByProject(id)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(project || {})

  if (!project) {
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
          <h2 className="text-xl font-bold text-neutral-800">Project Not Found</h2>
          <p className="text-neutral-600 mt-2">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    updateProject(project.id, editData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProject(project.id)
      router.push("/dashboard/projects")
    }
  }

  const getStatusStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      completed: tickets.filter((t) => t.status === "completed").length,
      archived: tickets.filter((t) => t.status === "archived").length,
    }
  }

  const stats = getStatusStats()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-neutral-600 bg-neutral-50 border-neutral-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "in-progress":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "completed":
        return "text-green-600 bg-green-50 border-green-200"
      case "archived":
        return "text-neutral-600 bg-neutral-50 border-neutral-200"
      default:
        return "text-neutral-600 bg-neutral-50 border-neutral-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </div>
        {canEditTickets() && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Project
                </button>
                {canDeleteTickets() && (
                  <button onClick={handleDelete} className="btn-danger flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input text-2xl font-bold"
                />
              ) : (
                <h1 className="text-2xl font-bold">{project.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                {isEditing ? (
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`text-xs px-2 py-1 border ${project.color}`}>{project.status}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
            className="input resize-none"
            placeholder="Project description..."
          />
        ) : (
          <p className="text-neutral-700 leading-relaxed">{project.description || "No description provided."}</p>
        )}

        <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-neutral-500">Created</p>
              <p className="font-medium">{formatDate(project.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-neutral-500">Created by</p>
              <p className="font-medium">{project.createdBy}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-neutral-500">Last Updated</p>
              <p className="font-medium">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-neutral-200 flex items-center justify-center">
              <span className="text-xs font-bold">#</span>
            </div>
            <div>
              <p className="text-neutral-500">Total Tickets</p>
              <p className="font-medium">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <div className="text-sm text-neutral-600">Open</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-neutral-600">In Progress</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-neutral-600">Completed</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-600">{stats.archived}</div>
            <div className="text-sm text-neutral-600">Archived</div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Tickets</h3>
            <Link
              href={`/dashboard/tickets/create?project=${project.id}`}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Ticket
            </Link>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 text-neutral-400" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-800 mb-2">No Tickets Yet</h4>
            <p className="text-neutral-600 mb-4">This project doesn't have any tickets yet.</p>
            <Link
              href={`/dashboard/tickets/create?project=${project.id}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:text-neutral-600">
                        <div className="text-sm font-medium text-neutral-900">{ticket.title}</div>
                        <div className="text-sm text-neutral-500 truncate max-w-xs">{ticket.description}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold border ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {ticket.assignee || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {ticket.dueDate ? formatDate(ticket.dueDate) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
