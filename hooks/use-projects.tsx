"use client"

import { useState, useMemo } from "react"
import type { Project } from "@/types"

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete redesign of the company website with modern UI/UX",
    status: "active",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "Admin User",
    color: "bg-blue-100 border-blue-300 text-blue-800",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Development of iOS and Android mobile applications",
    status: "active",
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    createdBy: "Admin User",
    color: "bg-green-100 border-green-300 text-green-800",
  },
  {
    id: "3",
    name: "Database Migration",
    description: "Migration from legacy database to new cloud infrastructure",
    status: "completed",
    createdAt: "2024-01-05T07:00:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
    createdBy: "Admin User",
    color: "bg-purple-100 border-purple-300 text-purple-800",
  },
]

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  })

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = !filters.status || project.status === filters.status
      const matchesSearch =
        !filters.search ||
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [projects, filters])

  const createProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const colors = [
      "bg-blue-100 border-blue-300 text-blue-800",
      "bg-green-100 border-green-300 text-green-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-yellow-100 border-yellow-300 text-yellow-800",
      "bg-red-100 border-red-300 text-red-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
    ]

    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
    }
    setProjects((prev) => [newProject, ...prev])
    return newProject
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project,
      ),
    )
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id))
  }

  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id)
  }

  return {
    projects,
    filteredProjects,
    filters,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
  }
}
