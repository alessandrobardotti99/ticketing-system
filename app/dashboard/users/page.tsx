"use client"

import { useState } from "react"
import { UserTable } from "@/components/user-table"
import { CreateUserModal } from "@/components/create-user-modal"
import { EditUserModal } from "@/components/edit-user-modal"
import { useUsers } from "@/hooks/use-users"
import { usePermissions } from "@/hooks/use-permissions"
import { Plus, Shield } from "lucide-react"
import type { User } from "@/types"

export default function UsersPage() {
  const { users } = useUsers()
  const { canCreateUsers, canViewUsers } = usePermissions()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  if (!canViewUsers()) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800">Access Denied</h2>
          <p className="text-neutral-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Utenti</h1>
          <p className="text-neutral-600 mt-2">Gestisci i membri del team e il personale</p>
        </div>
        {canCreateUsers() && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New User
          </button>
        )}
      </div>

      <UserTable users={users} onEditUser={setEditingUser} />

      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}
    </div>
  )
}
