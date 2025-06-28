"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Loader2, Mail, Clock, ArrowRight, Home } from "lucide-react"

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
        // Await params before using
        const { token } = await params
        
        const response = await fetch(`/api/invite/accept/${token}`, {
          method: "POST",
        })
        
        const data = await response.json()
        
        if (data.success) {
          setStatus("success")
          setMessage("Invito accettato con successo!")
          
          // Countdown per redirect
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval)
                router.push("/dashboard")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden"
        >
          {/* Header con icona */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white text-center mt-4"
            >
              Accettazione Invito
            </motion.h1>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute inset-0 w-12 h-12 border-2 border-blue-200 rounded-full"
                      />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    Processando invito...
                  </h2>
                  <p className="text-neutral-600">
                    Stiamo verificando e accettando il tuo invito al progetto
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-500">
                    <Clock className="w-4 h-4" />
                    <span>Questo potrebbe richiedere qualche secondo</span>
                  </div>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-semibold text-neutral-800 mb-2"
                  >
                    Fantastico!
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-green-600 font-medium mb-4"
                  >
                    {message}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
                  >
                    <p className="text-sm text-green-700 mb-2">
                      Ora hai accesso al progetto e puoi visualizzare tutti i ticket correlati.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <span>Reindirizzamento automatico in</span>
                      <span className="font-bold text-lg">{countdown}</span>
                      <span>secondi</span>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoToDashboard}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Vai alla Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-semibold text-neutral-800 mb-2"
                  >
                    Oops! Qualcosa è andato storto
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-red-600 font-medium mb-4"
                  >
                    {message}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                  >
                    <p className="text-sm text-red-700 mb-2">
                      Possibili cause:
                    </p>
                    <ul className="text-sm text-red-600 text-left space-y-1">
                      <li>• L'invito potrebbe essere già stato accettato</li>
                      <li>• Il link potrebbe essere scaduto</li>
                      <li>• L'invito potrebbe essere per un altro utente</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full bg-red-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Riprova
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="w-full bg-neutral-200 text-neutral-700 font-medium py-3 px-6 rounded-lg hover:bg-neutral-300 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      <span>Torna alla Home</span>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer informativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-neutral-500">
            Hai ricevuto questo invito via email per collaborare a un progetto
          </p>
        </motion.div>
      </div>
    </div>
  )
}