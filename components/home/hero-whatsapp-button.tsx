"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { waLink } from "@/lib/whatsapp"
import { MessageCircle, X } from "lucide-react"

type Contact = { number: string; label: string }

export function HeroWhatsappButton({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = useState(false)
  const valid = contacts.filter((c) => c.number && c.number.replace(/\D/g, "").length >= 10)
  const message = "Ola! Quero fazer um pedido na Vapor Max."

  // Se houver apenas um contato, abre direto sem menu.
  if (valid.length <= 1) {
    const number = valid[0]?.number ?? contacts[0]?.number ?? ""
    return (
      <Button
        render={<a href={waLink(number, message)} target="_blank" rel="noopener noreferrer" />}
        size="lg"
        className="bg-emerald-500 text-white hover:bg-emerald-600"
      >
        <MessageCircle className="mr-2 h-5 w-5 shrink-0" /> Falar no WhatsApp
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen((v) => !v)}
        size="lg"
        className="bg-emerald-500 text-white hover:bg-emerald-600"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {open ? <X className="mr-2 h-5 w-5 shrink-0" /> : <MessageCircle className="mr-2 h-5 w-5 shrink-0" />}
        Falar no WhatsApp
      </Button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card p-1.5 text-left shadow-xl"
          >
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Escolha um atendente</p>
            {valid.map((c) => (
              <a
                key={c.number}
                href={waLink(c.number, message)}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-emerald-500/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{c.label}</span>
                  <span className="block text-xs text-muted-foreground">Abrir conversa</span>
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
