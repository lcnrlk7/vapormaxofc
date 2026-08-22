import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPaymentLinkByToken, getSettings } from "@/lib/data"
import { formatBRL } from "@/lib/format"
import { waLink } from "@/lib/whatsapp"
import { PayButton } from "@/components/checkout/pay-button"
import { PaymentHelpAlert } from "@/components/checkout/payment-help-alert"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, MessageCircle, ShoppingBag, ShieldCheck, Lock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [link, settings] = await Promise.all([getPaymentLinkByToken(token), getSettings()])

  if (!link) notFound()

  const paid = link.status === "pago"
  const cancelled = link.status === "cancelado"
  const whatsapp = settings.whatsapp_number

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col items-center text-center">
        <Image
          src="/logo-vapormax.png"
          alt="Vapor Max"
          width={56}
          height={56}
          className="h-14 w-auto drop-shadow-[0_0_16px_rgba(255,45,149,0.45)]"
        />
        <h1 className="mt-3 font-heading text-xl font-bold">Resumo do pedido</h1>
        <p className="text-sm text-muted-foreground">Confira os itens e finalize o pagamento.</p>
      </header>

      <div className="space-y-4">
        {/* Status banners */}
        {paid && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Pagamento confirmado. Obrigado pela compra!</p>
          </div>
        )}
        {cancelled && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">Este link foi cancelado. Fale com a loja pelo WhatsApp.</p>
          </div>
        )}

        {/* Items */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold">
            <ShoppingBag className="h-4 w-4 text-primary" /> Itens
          </h2>
          <ul className="space-y-3">
            {link.parsedItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.image ? (
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.flavor ? `${item.flavor} · ` : ""}
                    {item.quantity} × {formatBRL(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatBRL(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Customer / delivery */}
        {(link.customerName || link.location) && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> Entrega
            </h2>
            {link.customerName && <p className="text-sm">{link.customerName}</p>}
            {link.location && <p className="text-sm text-muted-foreground">{link.location}</p>}
            {link.notes && <p className="mt-1 text-xs text-muted-foreground">Obs.: {link.notes}</p>}
          </section>
        )}

        {/* Summary */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(link.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{link.deliveryFee > 0 ? formatBRL(link.deliveryFee) : "A combinar"}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-heading text-lg font-bold">
              <span>Total</span>
              <span className="text-primary text-glow-pink">{formatBRL(link.total)}</span>
            </div>
          </div>
        </section>

        {/* Action */}
        {!paid && !cancelled && (
          <div className="space-y-3 pt-1">
            <PayButton body={{ token: link.token }} amountLabel={formatBRL(link.total)} />
            <PaymentHelpAlert whatsapp={whatsapp} reference={`o pedido de ${formatBRL(link.total)}`} />
            <Button
              render={
                <a
                  href={waLink(
                    whatsapp,
                    `Olá! Quero finalizar o pagamento do meu pedido (${formatBRL(link.total)}).`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              variant="outline"
              className="w-full border-emerald-500/40 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Tirar dúvida no WhatsApp
            </Button>
          </div>
        )}

        {/* Selo de segurança */}
        <div className="mt-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">Site seguro · Pagamento protegido</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Conexão criptografada
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Pagamento via PIX
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Dados protegidos
            </span>
          </div>
        </div>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Vapor Max
          </Link>{" "}
          · Venda proibida para menores de 18 anos.
        </p>
      </div>
    </main>
  )
}
