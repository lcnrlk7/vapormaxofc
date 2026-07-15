import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrderByNumber, getSettings } from "@/lib/data"
import { formatBRL } from "@/lib/format"
import { waLink } from "@/lib/whatsapp"
import { PayButton } from "@/components/checkout/pay-button"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, MessageCircle, ShoppingBag, ShieldCheck, Lock } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Pagamento do pedido | Vapor Max" }

export default async function OrderPayPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const [order, settings] = await Promise.all([getOrderByNumber(numero), getSettings()])

  if (!order) notFound()

  const paid = order.status === "Pago"
  const cancelled = order.status === "Cancelado"
  const whatsapp = settings.whatsapp_number

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col px-4 py-8">
      <header className="mb-6 flex flex-col items-center text-center">
        <Image
          src="/logo-vapormax.png"
          alt="Vapor Max"
          width={56}
          height={56}
          className="h-14 w-auto drop-shadow-[0_0_16px_rgba(255,45,149,0.45)]"
        />
        <h1 className="mt-3 font-heading text-xl font-bold">Pagamento do pedido</h1>
        <p className="text-sm text-muted-foreground">
          Pedido <span className="font-mono">{order.orderNumber}</span> · finalize com PIX abaixo.
        </p>
      </header>

      <div className="space-y-4">
        {paid && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Pagamento confirmado. Obrigado pela compra!</p>
          </div>
        )}
        {cancelled && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">Este pedido foi cancelado. Fale com a loja pelo WhatsApp.</p>
          </div>
        )}

        {/* Itens */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold">
            <ShoppingBag className="h-4 w-4 text-primary" /> Itens
          </h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.flavor ? `${item.flavor} · ` : ""}
                    {item.quantity} × {formatBRL(item.unitPrice)}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatBRL(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cliente / entrega */}
        {(order.customerName || order.address) && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> Entrega
            </h2>
            {order.customerName && <p className="text-sm">{order.customerName}</p>}
            {order.deliveryMethod === "entrega" ? (
              <p className="text-sm text-muted-foreground">
                {order.address}
                {order.city ? `, ${order.city}` : ""}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Retirada no local</p>
            )}
            {order.notes && <p className="mt-1 text-xs text-muted-foreground">Obs.: {order.notes}</p>}
          </section>
        )}

        {/* Resumo */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>
                {order.deliveryMethod === "retirada"
                  ? "Retirada no local"
                  : order.deliveryFee > 0
                    ? formatBRL(order.deliveryFee)
                    : "A combinar"}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-heading text-lg font-bold">
              <span>Total</span>
              <span className="text-primary text-glow-pink">{formatBRL(order.total)}</span>
            </div>
          </div>
        </section>

        {/* Ação */}
        {!paid && !cancelled && (
          <div className="space-y-3 pt-1">
            <PayButton
              body={{ orderNumber: order.orderNumber }}
              amountLabel={formatBRL(order.total)}
              checkoutUrl="/api/pedido/checkout"
              statusUrl="/api/pedido/status"
            />
            <Button
              render={
                <a
                  href={waLink(
                    whatsapp,
                    `Olá! Quero finalizar o pagamento do meu pedido ${order.orderNumber} (${formatBRL(order.total)}).`,
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
