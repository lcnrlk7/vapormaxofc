import { waLink } from "@/lib/whatsapp"
import { MessageCircle } from "lucide-react"

export function WhatsappFab({ number }: { number: string }) {
  return (
    <a
      href={waLink(number, "Ola! Gostaria de atendimento da Vapor Max.")}
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
