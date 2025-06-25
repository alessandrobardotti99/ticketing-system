"use client"

import type React from "react"

import { useState } from "react"
import { useTickets } from "@/hooks/use-tickets"
import { useUsers } from "@/hooks/use-users"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface CreateTicketModalProps {
  onClose: () => void
}

export function CreateTicketModal({ onClose }: CreateTicketModalProps) {
  const { createTicket } = useTickets()
  const { users } = useUsers()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "unassigned",
    dueDate: undefined as Date | undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTicket({
      ...formData,
      status: "open",
      dueDate: formData.dueDate?.toISOString(),
      assignee: formData.assignee === "unassigned" ? "" : formData.assignee,
    })
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create New Ticket</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <DatePicker
              date={formData.dueDate}
              onDateChange={(date) => setFormData({ ...formData, dueDate: date })}
              placeholder="Select due date"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Create Ticket
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
