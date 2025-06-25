"use client"

import { useUsers } from "@/hooks/use-users"
import { useProjects } from "@/hooks/use-projects"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TicketFiltersProps {
  filters: {
    status: string
    priority: string
    assignee: string
    projectId: string
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps) {
  const { users } = useUsers()
  const { projects } = useProjects()

  const handleFilterChange = (key: string, value: string) => {
    // Se il valore è "all", impostiamo una stringa vuota per resettare il filtro
    const filterValue = value === "all" ? "" : value
    onFiltersChange({ ...filters, [key]: filterValue })
  }

  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project</label>
          <Select value={filters.projectId || "all"} onValueChange={(value) => handleFilterChange("projectId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <Select value={filters.priority || "all"} onValueChange={(value) => handleFilterChange("priority", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Assignee</label>
          <Select value={filters.assignee || "all"} onValueChange={(value) => handleFilterChange("assignee", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.name}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
