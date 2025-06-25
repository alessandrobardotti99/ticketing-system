"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { Edit } from "lucide-react"
import type { User } from "@/types"

interface UserTableProps {
  users: User[]
  onEditUser: (user: User) => void
}

export function UserTable({ users, onEditUser }: UserTableProps) {
  const { canEditUsers, canDeleteUsers } = usePermissions()

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-neutral-100 text-neutral-800"
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              {(canEditUsers() || canDeleteUsers()) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-700 font-medium text-sm">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getRoleColor(user.role)} capitalize`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                {(canEditUsers() || canDeleteUsers()) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      {canEditUsers() && (
                        <button
                          onClick={() => onEditUser(user)}
                          className="text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
