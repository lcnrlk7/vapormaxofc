"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, X, Bell, Package, Sparkles } from "lucide-react"

// Aparece uma vez por sessão (toda vez que a pessoa abre o site de novo),
// somente depois de confirmar a idade no age gate.
const SESSION_KEY = "vapormax_group_invite_shown"
const AGE_KEY = "vapormax_age_verified"
const INSTAGRAM_KEY = "vapormax_instagram_welcome_shown"

export function GroupInvitePopup({ groupUrl }: { groupUrl?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!groupUrl) return
    if (sessionStorage.getItem(SESSION_KEY) === "true") return

    // Espera a confirmação de idade antes de exibir o convite.
    const tryShow = () => {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return true
      if (
        localStorage.getItem(AGE_KEY) === "true" &&
        sessionStorage.getItem(INSTAGRAM_KEY) === "true"
      ) {
        window.setTimeout(() => setOpen(true), 1200)
        sessionStorage.setItem(SESSION_KEY, "true")
        return true
      }
      return false
    }

    if (tryShow()) return
    const interval = setInterval(() => {
      if (tryShow()) clearInterval(interval)
    }, 600)
    return () => clearInterval(interval)
  }, [groupUrl])

  function close() {
    setOpen(false)
  }

  if (!groupUrl || !open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-invite-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <Users className="h-8 w-8" aria-hidden="true" />
          </span>
        </div>

        <h2 id="group-invite-title" className="font-heading text-2xl font-extrabold text-balance">
          Entre no nosso grupo do WhatsApp
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          É onde a gente avisa <span className="font-semibold text-foreground">primeiro</span> sobre tudo. Não fique
          de fora!
        </p>

        <ul className="mt-5 space-y-3 text-left">
          <li className="flex items-center gap-3 text-sm">
            <Bell className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>Avisos quando o Instagram ou o número cair</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <Package className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>Reposição de estoque em primeira mão</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <Sparkles className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>Novidades e promoções exclusivas</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            asChild
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={close}
          >
            <a href={groupUrl} target="_blank" rel="noopener noreferrer">
              <Users className="mr-2 h-5 w-5 shrink-0" />
              Entrar no grupo agora
            </a>
          </Button>
          <Button variant="outline" className="w-full border-border bg-transparent" onClick={close}>
            Agora não
          </Button>
        </div>
      </div>
    </div>
  )
}
