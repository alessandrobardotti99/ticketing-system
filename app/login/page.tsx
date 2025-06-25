"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { User, Lock, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(email, password)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Please try again.")
    }
    setIsLoading(false)
  }

  const demoAccounts = [
    { email: "admin@example.com", role: "Administrator", description: "Full access to all features" },
    { email: "manager@example.com", role: "Manager", description: "Can manage tickets and view reports" },
    { email: "user@example.com", role: "User", description: "Can view and edit assigned tickets" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-neutral-800 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">TicketFlow</h1>
            <p className="text-neutral-600 text-center text-sm">Professional Ticketing System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="card mt-6">
          <h3 className="font-semibold mb-4">Demo Accounts</h3>
          <div className="space-y-3">
            {demoAccounts.map((account) => (
              <div
                key={account.email}
                className="p-3 bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => {
                  setEmail(account.email)
                  setPassword("password")
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{account.email}</p>
                    <p className="text-xs text-neutral-600">{account.role}</p>
                  </div>
                  <span className="text-xs text-neutral-500">Click to use</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{account.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-4 text-center">
            Password for all accounts: <strong>password</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
