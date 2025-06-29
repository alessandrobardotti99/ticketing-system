"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, FileCheck, Clock, ArrowRight, Home, Shield } from "lucide-react"

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>
}

export default function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(3)
  
  useEffect(() => {
    async function acceptInvite() {
      try {
        const { token } = await params
        
        const response = await fetch(`/api/invite/accept/${token}`, {
          method: "POST",
        })
        
        const data = await response.json()
        
        if (data.success) {
          setStatus("success")
          setMessage("Invito accettato con successo!")
          
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval)
                router.push("/dashboard/projects")
                return 0
              }
              return prev - 1
            })
          }, 1000)
          
        } else {
          setStatus("error")
          setMessage(data.message || "Errore nell'accettazione dell'invito")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Errore di connessione")
      }
    }

    acceptInvite()
  }, [params, router])

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-300 shadow-sm">
          
          {/* Header istituzionale */}
          <div className="bg-primary text-white px-6 py-4 border-b border-gray-300">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <h1 className="text-lg font-semibold text-center">
              Verifica Autorizzazioni
            </h1>
            <p className="text-sm text-center opacity-90 mt-1">
              Sistema Gestione Progetti
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            
            {/* Loading State */}
            {status === "loading" && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
                <h2 className="text-base font-medium text-gray-900 mb-2">
                  Verifica in corso
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Controllo delle credenziali di accesso e autorizzazioni per il progetto richiesto.
                </p>
                <div className="bg-gray-50 border border-gray-200 p-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>Elaborazione dati...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <h2 className="text-base font-medium text-gray-900 mb-2">
                  Accesso Autorizzato
                </h2>
                
                <p className="text-sm text-primary font-medium mb-4">
                  {message}
                </p>
                
                <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-left">
                  <h3 className="text-xs font-medium text-gray-900 mb-2 uppercase tracking-wide">
                    Autorizzazioni Conferite
                  </h3>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Accesso completo al progetto</li>
                    <li>• Gestione ticket e documentazione</li>
                    <li>• Collaborazione con team membri</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                      <span>Reindirizzamento automatico tra</span>
                      <span className="font-medium text-primary">{countdown}s</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGoToDashboard}
                  className="w-full bg-primary text-white py-2 px-4 text-sm font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>Accedi al Sistema</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 bg-gray-100 border border-gray-300 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                
                <h2 className="text-base font-medium text-gray-900 mb-2">
                  Accesso Non Autorizzato
                </h2>
                
                <p className="text-sm text-red-700 font-medium mb-4">
                  {message}
                </p>
                
                <div className="bg-gray-50 border border-gray-200 p-4 mb-4 text-left">
                  <h3 className="text-xs font-medium text-gray-900 mb-2 uppercase tracking-wide">
                    Cause Possibili
                  </h3>
                  <ul className="text-xs text-gray-700 space-y-1 mb-3">
                    <li>• Invito già utilizzato</li>
                    <li>• Link di accesso scaduto</li>
                    <li>• Invito destinato ad altro utente</li>
                    <li>• Errore temporaneo del sistema</li>
                  </ul>
                  <div className="pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      Contattare l'amministratore per assistenza
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-red-600 text-white py-2 px-4 text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Riprova Operazione
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 text-sm font-medium hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Home className="w-3 h-3" />
                    <span>Pagina Principale</span>
                  </button>
                </div>
              </div>
            )}
            
          </div>

          {/* Footer istituzionale */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <FileCheck className="w-3 h-3" />
              <span>Protocollo di sicurezza verificato</span>
            </div>
          </div>
        </div>

        {/* Info sistema */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Sistema sicuro • Accesso controllato e monitorato
          </p>
        </div>
      </div>
    </div>
  )
}