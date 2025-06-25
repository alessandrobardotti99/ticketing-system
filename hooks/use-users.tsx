"use client"

import { useState } from "react"
import type { User } from "@/types"

const initialUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    role: "developer",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "designer",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@company.com",
    role: "developer",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "manager",
  },
  {
    id: "5",
    name: "Alex Chen",
    email: "alex.chen@company.com",
    role: "developer",
  },
]

export function useUsers() {
  const [users, setUsers] = useState<User[]>(initialUsers)

  const createUser = (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updates } : user)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
  }
}
