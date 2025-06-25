"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { User, Lock, Mail, UserPlus, Building } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validazione password
    if (formData.password !== formData.confirmPassword) {
      setError("Le password non corrispondono")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri")
      setIsLoading(false)
      return
    }

    const success = await register(formData.name, formData.email, formData.password, formData.company)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Errore durante la registrazione. Riprova.")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-neutral-800 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">Crea Account</h1>
            <p className="text-neutral-600 text-center text-sm">Unisciti a TicketFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Inserisci il tuo nome"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Indirizzo Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Inserisci la tua email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Azienda (Opzionale)
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input"
                placeholder="Nome della tua azienda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Crea una password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Conferma Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="Ripeti la password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Creazione account..." : "Crea Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Hai già un account?{" "}
              <a href="/login" className="text-neutral-800 hover:underline font-medium">
                Accedi qui
              </a>
            </p>
          </div>
        </div>

        <div className="card mt-6">
          <h3 className="font-semibold mb-3">Perché scegliere TicketFlow?</h3>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Gestione professionale dei ticket di supporto</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Interfaccia moderna e intuitiva</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Collaborazione in team efficace</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Report e analytics dettagliati</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}