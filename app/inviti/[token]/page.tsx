"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>
}

export default function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  
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
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
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

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {status === "loading" && <p>Processando invito...</p>}
      {status === "success" && <p style={{ color: "green" }}>{message}</p>}
      {status === "error" && <p style={{ color: "red" }}>{message}</p>}
    </div>
  )
}