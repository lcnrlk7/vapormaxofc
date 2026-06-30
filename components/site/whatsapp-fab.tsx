"use client"

import { useState } from "react"
import { waLink } from "@/lib/whatsapp"
import { MessageCircle, X } from "lucide-react"

type Contact = { number: string; label: string }

export function WhatsappFab({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = useState(false)
  const valid = contacts.filter((c) => c.number && c.number.replace(/\D/g, "").length >= 10)

  if (valid.length === 0) return null

  // Com apenas um contato, abre o WhatsApp direto (sem menu).
  if (valid.length === 1) {
    return (
      <a
        href={waLink(valid[0].number, "Ola! Gostaria de atendimento da Vapor Max.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 font-medium text-white shadow-lg shadow-emerald-500/40 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6 shrink-0" />
        <span className="whitespace-nowrap text-sm leading-none">Falar no WhatsApp</span>
      </a>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-2">
          {valid.map((c) => (
            <a
              key={c.number}
              href={waLink(c.number, `Ola ${c.label}! Gostaria de atendimento da Vapor Max.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-card px-4 py-2.5 font-medium text-foreground shadow-lg transition-transform hover:scale-105"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="whitespace-nowrap text-sm leading-none">{c.label}</span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar atendimento" : "Falar no WhatsApp"}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 font-medium text-white shadow-lg shadow-emerald-500/40 transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6 shrink-0" /> : <MessageCircle className="h-6 w-6 shrink-0" />}
        <span className="whitespace-nowrap text-sm leading-none">{open ? "Fechar" : "Falar no WhatsApp"}</span>
      </button>
    </div>
  )
}
