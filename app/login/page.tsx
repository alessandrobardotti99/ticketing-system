"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, LogIn } from "lucide-react"
import { signIn } from "@/server/users"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message || "Credenziali non valide. Riprova.")
      }
    } catch (error) {
      console.error("Errore login:", error)
      setError("Errore durante il login. Riprova.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgprimary/50">
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
                Indirizzo Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Inserisci la tua email"
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
                placeholder="Inserisci la tua password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Non hai un account?{" "}
              <a href="/registrazione" className="text-neutral-800 hover:underline font-medium">
                Registrati qui
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}