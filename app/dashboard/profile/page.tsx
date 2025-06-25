"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Shield, Camera, Save, X, Ticket, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTickets } from "@/hooks/use-tickets"
import { useProfile, UserProfile } from "@/hooks/use-profile"
import { getRoleDisplayName } from "@/db/schema"

export default function ProfilePage() {
  const { profile, isLoading, error, updateProfile } = useProfile()
  const { tickets } = useTickets()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})

  // Inizializza editedProfile quando il profilo viene caricato
  useEffect(() => {
    if (profile && !isEditing) {
      setEditedProfile({
        name: profile.name,
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        timezone: profile.timezone || "Europe/Rome",
      })
    }
  }, [profile, isEditing])

  // Calcola le statistiche dei ticket per l'utente corrente
  const ticketStats = useMemo(() => {
    if (!profile) return { total: 0, open: 0, inProgress: 0, completed: 0, assignedToMe: 0, createdByMe: 0 }

    const userTickets = tickets.filter((ticket) => 
      ticket.assignee === profile.name || ticket.createdBy === profile.name
    )

    const totalTickets = userTickets.length
    const openTickets = userTickets.filter((t) => t.status === "open").length
    const inProgressTickets = userTickets.filter((t) => t.status === "in-progress").length
    const completedTickets = userTickets.filter((t) => t.status === "completed").length
    const assignedToMe = userTickets.filter((t) => t.assignee === profile.name).length
    const createdByMe = userTickets.filter((t) => t.createdBy === profile.name).length

    return {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      completed: completedTickets,
      assignedToMe,
      createdByMe,
    }
  }, [tickets, profile])

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const result = await updateProfile(editedProfile)
      if (result.success) {
        setIsEditing(false)
        // Mostra un messaggio di successo se necessario
      }
    } catch (error) {
      console.error("Errore nel salvataggio:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({
        name: profile.name,
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        timezone: profile.timezone || "Europe/Rome",
      })
    }
    setIsEditing(false)
  }

  const handleEdit = () => {
    if (profile) {
      setEditedProfile({
        name: profile.name,
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        timezone: profile.timezone || "Europe/Rome",
      })
      setIsEditing(true)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Caricamento profilo...</span>
      </div>
    )
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Errore nel caricamento</h2>
          <p className="text-muted-foreground">{error || "Impossibile caricare il profilo"}</p>
        </div>
      </div>
    )
  }

  // Genera le iniziali per l'avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
          <h1 className="text-3xl font-bold">Profilo</h1>
          <p className="text-muted-foreground">Gestisci le impostazioni del tuo account</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <User className="w-4 h-4 mr-2" />
            Modifica Profilo
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salva Modifiche
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Annulla
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture */}
        <motion.div
          className="card flex items-center justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="text-center">
            <div className="relative inline-block">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {getInitials(profile.name)}
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-muted-foreground">{getRoleDisplayName(profile.role)}</p>
            {profile.company && (
              <p className="text-sm text-muted-foreground mt-1">{profile.company}</p>
            )}
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          className="card md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Informazioni Personali</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedProfile.name || ""}
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
              <Label htmlFor="email">Indirizzo Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.email}</span>
                {profile.emailVerified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Numero di Telefono</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedProfile.phone || ""}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  placeholder="+39 123 456 7890"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span>{profile.phone || "Non specificato"}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role">Ruolo</Label>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span>{getRoleDisplayName(profile.role)}</span>
              </div>
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
          <h3 className="text-lg font-semibold mb-4">Statistiche Ticket</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mx-auto mb-2">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
              <div className="text-sm text-muted-foreground">Ticket Totali</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-lg mx-auto mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-red-600">{ticketStats.open}</div>
              <div className="text-sm text-muted-foreground">Aperti</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Corso</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-green-600">{ticketStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completati</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Assegnati a Me</h4>
              <div className="text-2xl font-bold text-blue-600">{ticketStats.assignedToMe}</div>
              <div className="text-sm text-muted-foreground">Ticket attualmente assegnati</div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Creati da Me</h4>
              <div className="text-2xl font-bold text-purple-600">{ticketStats.createdByMe}</div>
              <div className="text-sm text-muted-foreground">Ticket che ho creato</div>
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
          <h3 className="text-lg font-semibold mb-4">Preferenze</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="timezone">Fuso Orario</Label>
              {isEditing ? (
                <Select
                  value={editedProfile.timezone || "Europe/Rome"}
                  onValueChange={(value) => setEditedProfile({ ...editedProfile, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Rome">Ora Italiana (CET)</SelectItem>
                    <SelectItem value="Europe/London">Ora di Greenwich (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Ora Europea Centrale (CET)</SelectItem>
                    <SelectItem value="America/New_York">Ora Orientale (ET)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Ora del Pacifico (PT)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <span>{profile.timezone?.replace("_", " ") || "Europe/Rome"}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}