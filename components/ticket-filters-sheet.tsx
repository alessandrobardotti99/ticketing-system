"use client"

import { useUsers } from "@/hooks/use-users"
import { useProjects } from "@/hooks/use-projects"
import { Filter, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface TicketFiltersSheetProps {
  filters: {
    status: string
    priority: string
    assignee: string
    projectId: string
    search: string
  }
  onFiltersChange: (filters: any) => void
}

export function TicketFiltersSheet({ filters, onFiltersChange }: TicketFiltersSheetProps) {
  const { users } = useUsers()
  const { projects } = useProjects()
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const filterValue = value === "all" ? "" : value
    onFiltersChange({ ...filters, [key]: filterValue })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: "",
      priority: "",
      assignee: "",
      projectId: "",
      search: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")
  const activeFilterCount = Object.values(filters).filter((value) => value !== "").length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <motion.button
          className="btn-secondary flex items-center gap-2 relative"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.1 }}
        >
          <Filter className="w-4 h-4" />
          Filters
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Tickets</SheetTitle>
          <SheetDescription>Refine your ticket view with these filters</SheetDescription>
        </SheetHeader>

        <motion.div
          className="space-y-6 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
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
            <Select
              value={filters.projectId || "all"}
              onValueChange={(value) => handleFilterChange("projectId", value)}
            >
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

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="pt-4 border-t border-border"
              >
                <motion.button
                  onClick={clearAllFilters}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.1 }}
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
