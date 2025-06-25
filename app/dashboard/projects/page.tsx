"use client"

import { useState } from "react"
import { useProjects } from "@/hooks/use-projects"
import { useTickets } from "@/hooks/use-tickets"
import { usePermissions } from "@/hooks/use-permissions"
import { Plus, FolderOpen, Calendar, Users, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ProjectsPage() {
  const { projects, filteredProjects, filters, setFilters } = useProjects()
  const { getTicketsByProject } = useTickets()
  const { canCreateTickets } = usePermissions()
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value === "all" ? "" : value })
  }

  const getProjectStats = (projectId: string) => {
    const tickets = getTicketsByProject(projectId)
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      completed: tickets.filter((t) => t.status === "completed").length,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-neutral-600 mt-2">Organize your work into projects</p>
        </div>
        {canCreateTickets() && (
          <Link href="/dashboard/projects/create" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-neutral-600 hover:text-neutral-800"
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const stats = getProjectStats(project.id)
          return (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <span className={`text-xs px-2 py-1 border ${project.color}`}>{project.status}</span>
                    </div>
                  </div>
                  <button className="text-neutral-400 hover:text-neutral-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Total Tickets</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{stats.open}</div>
                      <div className="text-neutral-500">Open</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{stats.inProgress}</div>
                      <div className="text-neutral-500">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{stats.completed}</div>
                      <div className="text-neutral-500">Completed</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {project.createdBy}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="card text-center py-12">
          <FolderOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Projects Found</h3>
          <p className="text-neutral-600 mb-4">
            {filters.search || filters.status
              ? "Try adjusting your filters"
              : "Create your first project to get started"}
          </p>
          {canCreateTickets() && (
            <Link href="/dashboard/projects/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
