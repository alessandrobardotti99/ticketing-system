"use client"

import { useState } from "react"
import { UserTable } from "@/components/user-table"
import { CreateUserModal } from "@/components/create-user-modal"
import { EditUserModal } from "@/components/edit-user-modal"
import { usePermissions } from "@/hooks/use-permissions"
import { useProfile } from "@/hooks/use-profile"
import { Plus, Shield } from "lucide-react"
import { motion } from "framer-motion"

// Tipo per User - definito qui se non è disponibile da @/types
interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "administrator";
  image?: string | null;
  emailVerified: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface UserWithProjects extends User {
  projects?: Array<{
    id: string;
    name: string;
    role: string;
    joinedAt: string;
    color?: string;
  }>;
}

export default function UsersPage() {
  const { canCreateUsers, canViewUsers, isLoading: permissionsLoading } = usePermissions()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithProjects | null>(null)

  // ✅ Loading skeleton per i permessi
  if (permissionsLoading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Utenti</h1>
            <p className="text-neutral-600 mt-2">Gestisci i membri del team e il personale</p>
          </div>
          <div className="h-10 bg-neutral-200 rounded animate-pulse w-28"></div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
              </div>
              <div className="sm:w-48">
                <div className="h-10 bg-neutral-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="h-64 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    )
  }

  // ✅ Accesso negato (solo DOPO aver caricato i permessi)
  if (!permissionsLoading && !canViewUsers()) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800">Accesso Negato</h2>
          <p className="text-neutral-600 mt-2">Non hai i permessi per visualizzare questa pagina.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Utenti</h1>
          <p className="text-neutral-600 mt-2">Gestisci i membri del team e il personale</p>
        </div>
        {canCreateUsers() && (
          <motion.button 
            onClick={() => setShowCreateModal(true)} 
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" />
            New User
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <UserTable onEditUser={setEditingUser} />
      </motion.div>

      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </motion.div>
  )
}