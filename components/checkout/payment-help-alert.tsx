import { AlertTriangle, MessageCircle } from "lucide-react"
import { waLink } from "@/lib/whatsapp"

type PaymentHelpAlertProps = {
  whatsapp: string
  reference?: string
}

export function PaymentHelpAlert({ whatsapp, reference }: PaymentHelpAlertProps) {
  const message = reference
    ? `Olá! Recebi um alerta ao tentar pagar ${reference}. Podem me ajudar?`
    : "Olá! Recebi um alerta ao tentar fazer o pagamento. Podem me ajudar?"

  return (
    <aside
      aria-label="Ajuda com o pagamento"
      className="rounded-xl border border-primary/40 bg-primary/10 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-2">
          <div>
            <h2 className="font-heading text-sm font-bold">Apareceu algum alerta ao pagar?</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Tente novamente usando outro banco. Se o alerta continuar, fale com a gente pelo WhatsApp.
            </p>
          </div>
          <a
            href={waLink(whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Avisar pelo WhatsApp
          </a>
        </div>
      </div>
    </aside>
  )
}
