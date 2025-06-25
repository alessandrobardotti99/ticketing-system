"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { User, Mail, Shield, Camera, Save, X, Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useTickets } from "@/hooks/use-tickets"

export default function ProfilePage() {
  const { user } = useAuth()
  const { tickets } = useTickets()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
    bio: "System administrator with 5+ years of experience in IT support and project management.",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    timezone: "America/New_York",
  })

  const [editedProfile, setEditedProfile] = useState(profile)

  // Calcola le statistiche dei ticket per l'utente corrente
  const ticketStats = useMemo(() => {
    const userTickets = tickets.filter((ticket) => ticket.assignee === user?.name || ticket.createdBy === user?.name)

    const totalTickets = userTickets.length
    const openTickets = userTickets.filter((t) => t.status === "open").length
    const inProgressTickets = userTickets.filter((t) => t.status === "in-progress").length
    const completedTickets = userTickets.filter((t) => t.status === "completed").length
    const assignedToMe = userTickets.filter((t) => t.assignee === user?.name).length
    const createdByMe = userTickets.filter((t) => t.createdBy === user?.name).length

    return {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      completed: completedTickets,
      assignedToMe,
      createdByMe,
    }
  }, [tickets, user])

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
    // Here you would typically save to your backend
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                AU
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-muted-foreground">{profile.role}</p>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          className="card md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.name}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span>{profile.role}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Ticket Statistics */}
        <motion.div
          className="card md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4">Ticket Statistics</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mx-auto mb-2">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tickets</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-lg mx-auto mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-red-600">{ticketStats.open}</div>
              <div className="text-sm text-muted-foreground">Open Tickets</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-green-600">{ticketStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Assigned to Me</h4>
              <div className="text-2xl font-bold text-blue-600">{ticketStats.assignedToMe}</div>
              <div className="text-sm text-muted-foreground">Tickets currently assigned</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Created by Me</h4>
              <div className="text-2xl font-bold text-purple-600">{ticketStats.createdByMe}</div>
              <div className="text-sm text-muted-foreground">Tickets I've created</div>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          className="card md:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              {isEditing ? (
                <Select
                  value={editedProfile.timezone}
                  onValueChange={(value) => setEditedProfile({ ...editedProfile, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <span>{profile.timezone.replace("_", " ")}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
