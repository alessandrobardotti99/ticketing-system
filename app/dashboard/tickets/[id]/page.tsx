"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTickets } from "@/hooks/use-tickets"
import { useUsers } from "@/hooks/use-users"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import { usePermissions } from "@/hooks/use-permissions"
import { ArrowLeft, Clock, User, Calendar, Flag, Edit, Save, X, Shield, MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

export default function TicketDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { tickets, updateTicket } = useTickets()
  const { users } = useUsers()
  const { statuses, getStatusLabel } = useTicketStatuses()
  const { canAccessTicket, canEditTicket } = usePermissions()

  const [ticket, setTicket] = useState(tickets.find((t) => t.id === id))
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(ticket || {})
  const [newComment, setNewComment] = useState("")

  // Aggiorna il ticket quando cambia l'ID o i tickets
  useEffect(() => {
    const found = tickets.find((t) => t.id === id)
    setTicket(found)
    setEditData(found || {})
  }, [id, tickets])

  if (!ticket) {
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
          <h2 className="text-xl font-bold text-neutral-800">Ticket Not Found</h2>
          <p className="text-neutral-600 mt-2">The ticket you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  if (!canAccessTicket(ticket)) {
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
          <p className="text-neutral-600 mt-2">You don't have permission to view this ticket.</p>
        </div>
      </div>
    )
  }

  const canEdit = canEditTicket(ticket)

  const handleSave = () => {
    updateTicket(ticket.id, editData)
    setIsEditing(false)
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedTicket = {
        ...ticket,
        comments: [
          ...(ticket.comments || []),
          {
            id: Date.now().toString(),
            text: newComment,
            author: "Current User",
            createdAt: new Date().toISOString(),
          },
        ],
      }
      updateTicket(ticket.id, updatedTicket)
      setNewComment("")
    }
  }

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
            Back to Tickets
          </button>
        </div>
        {canEdit && (
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
              <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Ticket
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">Ticket #{ticket.id}</span>
          </div>
        </div>
        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="input text-2xl font-bold"
            disabled={!canEdit}
          />
        ) : (
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Description</h3>
            </div>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={6}
                className="input resize-none"
                disabled={!canEdit}
              />
            ) : (
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Comments & Activity</h3>
                <span className="badge-primary">{ticket.comments?.length || 0}</span>
              </div>
            </div>
            <div className="space-y-4">
              {ticket.comments?.map((comment) => (
                <div key={comment.id} className="bg-neutral-50 border border-neutral-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-neutral-300 flex items-center justify-center text-xs font-medium">
                        {comment.author.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{comment.author}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="font-medium mb-3">Add Comment</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows={4}
                className="input resize-none"
              />
              <button onClick={handleAddComment} className="btn-primary mt-3" disabled={!newComment.trim()}>
                Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Status
                </label>
                {isEditing && canEdit ? (
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={`text-sm font-medium capitalize px-3 py-2 border ${getStatusColor(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Flag className="w-4 h-4" />
                  Priority
                </label>
                {isEditing && canEdit ? (
                  <Select
                    value={editData.priority}
                    onValueChange={(value) => setEditData({ ...editData, priority: value })}
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
                ) : (
                  <div
                    className={`text-sm font-medium capitalize px-3 py-2 border ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Assignee
                </label>
                {isEditing && canEdit ? (
                  <Select
                    value={editData.assignee || "unassigned"}
                    onValueChange={(value) =>
                      setEditData({ ...editData, assignee: value === "unassigned" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                ) : (
                  <div className="text-sm px-3 py-2 bg-neutral-50 border border-neutral-200">
                    {ticket.assignee || "Unassigned"}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </label>
                {isEditing && canEdit ? (
                  <DatePicker
                    date={editData.dueDate ? new Date(editData.dueDate) : undefined}
                    onDateChange={(date) => setEditData({ ...editData, dueDate: date?.toISOString() })}
                    placeholder="Select due date"
                  />
                ) : (
                  <div className="text-sm px-3 py-2 bg-neutral-50 border border-neutral-200">
                    {ticket.dueDate ? formatDate(ticket.dueDate) : "No due date"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Timeline</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-600">Created:</span>
                <div className="text-neutral-800">{formatDate(ticket.createdAt)}</div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-neutral-600">Last Updated:</span>
                <div className="text-neutral-800">{formatDate(ticket.updatedAt || ticket.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
