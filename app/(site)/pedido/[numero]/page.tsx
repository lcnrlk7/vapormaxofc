import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSettings } from "@/lib/data"
import { waLink } from "@/lib/whatsapp"
import { CheckCircle2, MessageCircle, Home } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Pedido confirmado | Vapor Max" }

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
  const settings = await getSettings()

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">Pedido enviado!</h1>
        <p className="text-muted-foreground text-pretty">
          Seu pedido <span className="font-semibold text-foreground">{numero}</span> foi registrado. Finalize a
          conversa no WhatsApp para confirmar pagamento e entrega.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600">
          <a
            href={waLink(settings.whatsapp_number, `Olá! Acabei de fazer o pedido ${numero} no site.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap"
          >
            <MessageCircle className="mr-2 h-5 w-5 shrink-0" /> Abrir WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="flex-1 border-border bg-transparent">
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap">
            <Home className="mr-2 h-5 w-5 shrink-0" /> Voltar ao início
          </Link>
        </Button>
      </div>
    </div>
  )
}
