import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from "react"
import {
    ArrowRight
} from "lucide-react"

export const HeroSection = () => {

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


    return (
        <div className="mb-8">
            <main>
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-87.5 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-white dark:bg-transparent">
                    <div className="relative mx-auto px-6 py-28 lg:py-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">Modern Software testing reimagined</h1>
                            <p className="mx-auto my-8 max-w-2xl text-xl">Officiis laudantium excepturi ducimus rerum dignissimos, and tempora nam vitae, excepturi ducimus iste provident dolores.</p>

                            <div>
                               
                               
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
                                    <Button size="lg" variant="outline" asChild className="text-lg px-8 text-primary">
                                        <Link href="#features">Scopri le Funzionalità</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto -mt-16 max-w-7xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                        <div className="[perspective:1200px] [mask-image:linear-gradient(to_right,black_50%,transparent_100%)] lg:pl-40">
                            <div className="[transform:rotateX(20deg);]">
                                <div className="lg:h-[44rem] relative skew-x-[.36rad]">
                                    <img
                                        className="rounded-[--radius] z-[2] relative border dark:hidden"
                                        src="./hero.png"
                                        alt="Tailark hero section"
                                        width={3880}
                                        height={2074}
                                    />
                                    <img
                                        className="rounded-[--radius] z-[2] relative hidden border dark:block"
                                       src="./hero.png"
                                        alt="Tailark hero section"
                                        width={3880}
                                        height={2074}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}