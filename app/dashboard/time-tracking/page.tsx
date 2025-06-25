"use client"

import type React from "react"

import { useState } from "react"
import { useTickets } from "@/hooks/use-tickets"
import { useUsers } from "@/hooks/use-users"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Clock, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface TimeEntry {
  id: string
  ticketId: string
  ticketTitle: string
  userId: string
  userName: string
  hours: number
  minutes: number
  description: string
  date: string
}

export default function TimeTrackingPage() {
  const { tickets } = useTickets()
  const { users } = useUsers()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      ticketId: "1",
      ticketTitle: "Fix login authentication bug",
      userId: "1",
      userName: "John Smith",
      hours: 2,
      minutes: 30,
      description: "Investigated authentication middleware and fixed session handling",
      date: "2024-01-16",
    },
    {
      id: "2",
      ticketId: "2",
      ticketTitle: "Update user dashboard design",
      userId: "2",
      userName: "Sarah Johnson",
      hours: 4,
      minutes: 15,
      description: "Created new mockups and implemented responsive design",
      date: "2024-01-16",
    },
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    ticketId: "",
    userId: "",
    hours: 0,
    minutes: 0,
    description: "",
    date: new Date(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ticket = tickets.find((t) => t.id === formData.ticketId)
    const user = users.find((u) => u.id === formData.userId)

    if (ticket && user) {
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        ticketId: formData.ticketId,
        ticketTitle: ticket.title,
        userId: formData.userId,
        userName: user.name,
        hours: formData.hours,
        minutes: formData.minutes,
        description: formData.description,
        date: formData.date.toISOString().split("T")[0],
      }
      setTimeEntries([newEntry, ...timeEntries])
      setFormData({
        ticketId: "",
        userId: "",
        hours: 0,
        minutes: 0,
        description: "",
        date: new Date(),
      })
      setShowAddForm(false)
    }
  }

  const formatTime = (hours: number, minutes: number) => {
    return `${hours}h ${minutes}m`
  }

  const getTotalTime = () => {
    const total = timeEntries.reduce((acc, entry) => {
      return acc + entry.hours * 60 + entry.minutes
    }, 0)
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    return formatTime(hours, minutes)
  }

  const getTodayTime = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayEntries = timeEntries.filter((entry) => entry.date === today)
    const total = todayEntries.reduce((acc, entry) => {
      return acc + entry.hours * 60 + entry.minutes
    }, 0)
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    return formatTime(hours, minutes)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-neutral-600 mt-2">Track time spent on tickets and projects</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Time Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-neutral-600" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Time</p>
              <p className="text-2xl font-bold">{getTotalTime()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-neutral-600" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Today</p>
              <p className="text-2xl font-bold">{getTodayTime()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center">
              <span className="text-sm font-bold">#</span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600">Entries</p>
              <p className="text-2xl font-bold">{timeEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Add Time Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ticket</label>
                <Select
                  value={formData.ticketId}
                  onValueChange={(value) => setFormData({ ...formData, ticketId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    {tickets.map((ticket) => (
                      <SelectItem key={ticket.id} value={ticket.id}>
                        {ticket.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">User</label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: Number.parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: Number.parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <DatePicker
                  date={formData.date}
                  onDateChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                  placeholder="Select date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input resize-none"
                placeholder="Describe the work performed..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Add Entry
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Time Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {timeEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{formatDate(entry.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{entry.ticketTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{entry.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {formatTime(entry.hours, entry.minutes)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs truncate">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
