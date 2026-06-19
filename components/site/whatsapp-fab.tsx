import { waLink } from "@/lib/whatsapp"
import { MessageCircle } from "lucide-react"

export function WhatsappFab({ number }: { number: string }) {
  return (
    <a
      href={waLink(number, "Ola! Gostaria de atendimento da Vapor Max.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/40" />
    </a>
  )
}
