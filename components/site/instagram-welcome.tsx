"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, Truck, X } from "lucide-react"

const SESSION_KEY = "vapormax_instagram_welcome_shown"
const AGE_KEY = "vapormax_age_verified"

export function InstagramWelcome({ instagramUrl }: { instagramUrl: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!instagramUrl || sessionStorage.getItem(SESSION_KEY) === "true") return

    const tryShow = () => {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return true
      if (localStorage.getItem(AGE_KEY) === "true") {
        setOpen(true)
        sessionStorage.setItem(SESSION_KEY, "true")
        return true
      }
      return false
    }

    if (tryShow()) return
    const interval = window.setInterval(() => {
      if (tryShow()) window.clearInterval(interval)
    }, 600)
    return () => window.clearInterval(interval)
  }, [instagramUrl])

  if (!open || !instagramUrl) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-background/90 p-3 backdrop-blur-md sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="instagram-welcome-title">
      <div className="relative grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-primary/40 bg-card shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-secondary">
          <X className="size-5" />
        </button>

        <div className="relative min-h-48 overflow-hidden sm:min-h-64 lg:min-h-[560px]">
          <Image src="/images/vapor-max-instagram.png" alt="Arte promocional da Vapor Max" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-top" />
        </div>

        <div className="flex flex-col justify-center gap-6 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <Image src="/logo-vapormax.png" alt="Vapor Max" width={64} height={64} className="size-14 rounded-full border border-primary/40 object-cover sm:size-16" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Instagram oficial</p>
              <p className="text-lg font-bold text-foreground sm:text-xl">@vapormaxoficial</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 id="instagram-welcome-title" className="font-heading text-3xl font-black uppercase leading-tight text-balance sm:text-4xl">Siga a Vapor Max e fique por dentro</h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">Novidades, reposições e ofertas em primeira mão. Somos de São Luís, Maranhão.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4">
              <MapPin className="size-5 shrink-0 text-primary" />
              <span className="text-sm font-semibold">São Luís — MA</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4">
              <Truck className="size-5 shrink-0 text-primary" />
              <span className="text-sm font-semibold">Entrega fixa: R$ 8</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button render={<a href={instagramUrl} target="_blank" rel="noopener noreferrer" />} size="lg" className="min-h-12 flex-1" onClick={() => setOpen(false)}>
              <Camera data-icon="inline-start" /> Seguir no Instagram
            </Button>
            <Button variant="outline" size="lg" className="min-h-12 flex-1 bg-transparent" onClick={() => setOpen(false)}>Continuar no site</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
