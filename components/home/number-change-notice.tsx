import { AlertTriangle } from "lucide-react"
import { waLink } from "@/lib/whatsapp"

function formatWhatsappDisplay(raw: string) {
  // Espera algo como 5598986923587 -> (98) 98692-3587
  const digits = raw.replace(/\D/g, "")
  const local = digits.startsWith("55") ? digits.slice(2) : digits
  if (local.length < 10) return raw
  const ddd = local.slice(0, 2)
  const rest = local.slice(2)
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
}

export function NumberChangeNotice({ number }: { number: string }) {
  const display = formatWhatsappDisplay(number)

  return (
    <div
      role="alert"
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-3 text-center text-amber-100"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
        <span className="flex items-center gap-2 font-semibold text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          Atencao: mudamos de numero!
        </span>
        <p className="text-pretty text-sm text-amber-100/90">
          Nosso novo WhatsApp e{" "}
          <a
            href={waLink(number, "Ola! Vim pelo site da Vapor Max.")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-amber-50 underline underline-offset-2 hover:text-white"
          >
            {display}
          </a>
          . Salve o contato e desconsidere o numero antigo.
        </p>
      </div>
    </div>
  )
}
