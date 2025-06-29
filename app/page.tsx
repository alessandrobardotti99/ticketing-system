"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import {
  Ticket,
  Users,
  BarChart3,
  Settings,
  Clock,
  ArrowRight,
  Zap,
  Shield,
  Smartphone,
  Star,
  Globe,
  FileText,
  ChevronDown,
  Gift,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  bio: string
  phone: string
  location: string
  timezone: string
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica la sessione utente al caricamento del componente
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUser(data.data)
          }
        }
      } catch (error) {
        console.error('Errore nel verificare la sessione:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserSession()
  }, [])

  const features = [
    {
      icon: <Ticket className="w-8 h-8" />,
      title: "Gestione Ticket Avanzata",
      description:
        "Sistema Kanban intuitivo per visualizzare e gestire il flusso di lavoro. Drag & drop, filtri avanzati e automazioni intelligenti.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team & Collaborazione",
      description:
        "Gestione completa di utenti, ruoli e permessi. Assegnazioni automatiche e notifiche in tempo reale per il team.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Insights",
      description:
        "Dashboard ricca di statistiche, grafici interattivi e report personalizzabili per monitorare le performance.",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Personalizzazione Totale",
      description:
        "Status custom, campi personalizzati, workflow adattabili e temi per adattarsi perfettamente alle tue esigenze.",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time Tracking Integrato",
      description:
        "Tracciamento automatico del tempo, timer integrati e reportistica dettagliata per fatturazione e produttività.",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Gestione Progetti",
      description:
        "Organizza ticket in progetti, milestone e roadmap. Gestione completa del ciclo di vita dei progetti aziendali.",
    },
  ]

  const benefits = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "100% Gratuito",
      description: "Nessun costo nascosto, nessun limite di tempo. Completamente gratuito per sempre.",
      highlight: true,
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Veloce & Moderno",
      description: "Interfaccia reattiva costruita con le tecnologie più avanzate per prestazioni ottimali.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sicuro & Affidabile",
      description: "Crittografia end-to-end, backup automatici e conformità GDPR per la massima sicurezza.",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Multi-Dispositivo",
      description: "Accesso completo da desktop, tablet e smartphone con sincronizzazione in tempo reale.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Cloud-Native",
      description: "Architettura scalabile nel cloud, sempre aggiornato e accessibile ovunque nel mondo.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Open Source",
      description: "Codice aperto, community attiva e possibilità di contribuire allo sviluppo del progetto.",
    },
  ]


  const testimonials = [
    {
      name: "Marco Rossi",
      role: "IT Manager",
      company: "TechCorp Italia",
      content:
        "Incredibile che sia completamente gratuito! Funzionalità che normalmente costerebbero centinaia di euro al mese.",
      rating: 5,
    },
    {
      name: "Laura Bianchi",
      role: "Project Manager",
      company: "Digital Solutions",
      content:
        "La migliore soluzione gratuita per la gestione ticket. Il nostro team ha aumentato la produttività del 200%.",
      rating: 5,
    },
    {
      name: "Giuseppe Verdi",
      role: "CEO",
      company: "StartupFlow",
      content: "Perfetto per startup. Tutte le funzionalità enterprise senza costi. Un game-changer assoluto!",
      rating: 5,
    },
  ]

  const faqs = [
    {
      question: "È davvero completamente gratuito?",
      answer:
        "Sì! Index è 100% gratuito, senza limiti di utenti, ticket o funzionalità. Non ci sono costi nascosti o piani premium.",
    },
    {
      question: "Ci sono limiti sul numero di ticket o utenti?",
      answer:
        "No, non ci sono limiti. Puoi creare ticket illimitati, aggiungere tutti gli utenti che vuoi e utilizzare tutte le funzionalità senza restrizioni.",
    },
    {
      question: "Come fate a mantenerlo gratuito?",
      answer:
        "Index è un progetto open source sostenuto dalla community. Crediamo che gli strumenti di produttività dovrebbero essere accessibili a tutti.",
    },
    {
      question: "Posso usarlo per la mia azienda?",
      answer:
        "Assolutamente sì! Index è perfetto sia per piccole startup che per grandi aziende. Scala automaticamente con le tue esigenze.",
    },
    {
      question: "I miei dati sono sicuri?",
      answer:
        "Sì, utilizziamo crittografia end-to-end, backup automatici e rispettiamo tutti gli standard di sicurezza e privacy GDPR.",
    },
    {
      question: "Posso personalizzare il sistema?",
      answer:
        "Certamente! Puoi personalizzare status, campi, workflow, temi e molto altro. Essendo open source, puoi anche modificare il codice.",
    },
    {
      question: "C'è supporto disponibile?",
      answer:
        "Sì, abbiamo una community attiva, documentazione completa e guide dettagliate. La community è sempre pronta ad aiutare!",
    },
    {
      question: "Posso migrare da altri sistemi?",
      answer:
        "Sì, offriamo strumenti di importazione per i principali sistemi di ticketing e guide dettagliate per la migrazione dei dati.",
    },
  ]

  return (
    <div className="min-h-screen bg-bgprimary/50">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="flex items-center justify-center">
                              <Image src={"/logo.svg"} alt="logo" width={150} height={150}></Image>
                          </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm hover:text-primary transition-colors">
                Funzionalità
              </Link>
              <Link href="#benefits" className="text-sm hover:text-primary transition-colors">
                Vantaggi
              </Link>
              <Link href="#testimonials" className="text-sm hover:text-primary transition-colors">
                Recensioni
              </Link>
              <Link href="#faq" className="text-sm hover:text-primary transition-colors">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        Ciao, {user.name.split(' ')[0]}!
                      </span>
                      <Button asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    </div>
                  ) : (
                    <Button asChild>
                      <Link href="/login">Inizia Gratis</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge
            variant="secondary"
            className="mb-4 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            🎉 100% Gratuito • Nessun Limite • Open Source
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Il Sistema di Ticketing Completamente Gratuito
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gestisci ticket, progetti e team senza limiti. Tutte le funzionalità enterprise, completamente gratis per
            sempre. Nessun costo nascosto, nessuna scadenza.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!isLoading && (
              <>
                {user ? (
                  <Button size="lg" asChild className="text-lg px-8">
                    <Link href="/dashboard">
                      Vai alla Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild className="text-lg px-8">
                    <Link href="/login">
                      Inizia Subito Gratis <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                )}
              </>
            )}
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="#features">Scopri le Funzionalità</Link>
            </Button>
          </div>

          {/* Stats */}
         
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Funzionalità Complete</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tutto quello che serve per gestire professionalmente i tuoi ticket, completamente gratuito
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 border">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perché scegliere Index?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">I vantaggi che fanno la differenza</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={`h-full p-6 text-center hover:shadow-lg transition-all duration-300 ${
                    benefit.highlight ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      benefit.highlight ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
                    }`}
                  >
                    <div className={benefit.highlight ? "text-green-600 dark:text-green-400" : "text-primary"}>
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cosa dicono i nostri utenti</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Testimonianze reali da chi ha trasformato il proprio workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Domande Frequenti</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tutto quello che devi sapere su Index
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          {user ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Bentornato, {user.name.split(' ')[0]}!</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Accedi alla tua dashboard per gestire i tuoi ticket e progetti.
              </p>
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/dashboard">
                  Vai alla Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Inizia Subito, È Completamente Gratuito!</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Nessuna carta di credito richiesta. Nessun limite di tempo. Tutte le funzionalità incluse.
              </p>
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/login">
                  Accedi Ora Gratis <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </>
          )}
          <p className="text-sm text-muted-foreground mt-4">Setup in 30 secondi • Nessuna configurazione complessa</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center rounded">
                  <span className="text-primary-foreground font-bold text-sm">TF</span>
                </div>
                <span className="font-bold text-xl">Index</span>
              </div>
              <p className="text-muted-foreground">
                Il sistema di ticketing completamente gratuito che trasforma il modo di gestire il supporto.
              </p>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                100% Gratuito Forever
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Funzionalità
                  </Link>
                </li>
                <li>
                  <Link href="#benefits" className="hover:text-primary transition-colors">
                    Vantaggi
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Contribuisci
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Risorse</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Documentazione
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Guide
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 Index. Open Source • Completamente Gratuito</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-6 text-left hover:bg-muted/50 transition-colors">
            <h3 className="font-semibold text-lg">{question}</h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-6 pb-6">
            <p className="text-muted-foreground leading-relaxed">{answer}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}