"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/cart-provider"
import { createOrder } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatBRL } from "@/lib/format"
import { waLink } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"
import { Truck, Store, ShoppingBag, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function CheckoutForm({
  whatsappNumber,
}: {
  whatsappNumber: string
}) {
  const { items, subtotal, clear } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    city: "",
    notes: "",
  })
  const [delivery, setDelivery] = useState<"entrega" | "retirada">("entrega")
  const payment = "Pix"

  // Frete é a combinar pelo WhatsApp, conforme a localização do cliente.
  const total = subtotal

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      toast.error("Preencha nome e telefone.")
      return
    }
    if (delivery === "entrega" && !form.address.trim()) {
      toast.error("Informe o endereço de entrega.")
      return
    }
    setLoading(true)
    const res = await createOrder({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      address: form.address,
      city: form.city,
      notes: form.notes,
      deliveryMethod: delivery,
      paymentMethod: payment,
      deliveryFee: 0,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        flavor: i.flavor,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    })
    setLoading(false)

    if (!res.ok) {
      toast.error(res.error)
      return
    }

    // Build WhatsApp message
    const lines = [
      `*Novo pedido - Vapor Max*`,
      `Pedido: *${res.orderNumber}*`,
      ``,
      `*Cliente:* ${form.customerName}`,
      `*Telefone:* ${form.customerPhone}`,
      delivery === "entrega"
        ? `*Entrega:* ${form.address}${form.city ? `, ${form.city}` : ""}`
        : `*Retirada no local*`,
      `*Pagamento:* ${payment}`,
      form.notes ? `*Obs:* ${form.notes}` : "",
      ``,
      `*Itens:*`,
      ...items.map(
        (i) =>
          `• ${i.quantity}x ${i.name}${i.flavor ? ` (${i.flavor})` : ""} - ${formatBRL(i.unitPrice * i.quantity)}`,
      ),
      ``,
      `Subtotal: ${formatBRL(subtotal)}`,
      delivery === "entrega" ? `Frete: a combinar (conforme localização)` : `Retirada no local`,
      `*Total dos produtos: ${formatBRL(total)}*`,
    ]
      .filter(Boolean)
      .join("\n")

    clear()
    toast.success("Pedido enviado! Abrindo WhatsApp...")
    window.open(waLink(whatsappNumber, lines), "_blank")
    router.push(`/pedido/${res.orderNumber}`)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Button render={<Link href="/catalogo" />}>Ver catálogo</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Delivery method */}
        <div>
          <h2 className="mb-3 font-heading text-lg font-semibold">Como você quer receber?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDelivery("entrega")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                delivery === "entrega" ? "border-primary bg-primary/10" : "border-border bg-card",
              )}
            >
              <Truck className={cn("h-6 w-6", delivery === "entrega" ? "text-primary" : "text-muted-foreground")} />
              <span className="text-sm font-medium">Entrega</span>
            </button>
            <button
              type="button"
              onClick={() => setDelivery("retirada")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                delivery === "retirada" ? "border-primary bg-primary/10" : "border-border bg-card",
              )}
            >
              <Store className={cn("h-6 w-6", delivery === "retirada" ? "text-primary" : "text-muted-foreground")} />
              <span className="text-sm font-medium">Retirar no local</span>
            </button>
          </div>
        </div>

        {/* Customer data */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Seus dados</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Primeiro nome *</Label>
              <Input
                id="name"
                placeholder="Ex.: João"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">WhatsApp / Telefone *</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="(98) 99999-9999"
                value={form.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value)}
                required
              />
            </div>
          </div>

          {delivery === "entrega" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Endereço (rua, número, bairro) *</Label>
                <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Ponto de referência, preferências..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        {/* Payment */}
        <div>
          <h2 className="mb-3 font-heading text-lg font-semibold">Forma de pagamento</h2>
          <div className="flex items-center gap-2 rounded-full border border-primary bg-primary/15 px-4 py-2 text-sm text-primary">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Pix
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            A chave Pix é enviada pelo WhatsApp após a confirmação do pedido.
          </p>
        </div>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20">
        <h2 className="mb-4 font-heading text-lg font-semibold">Resumo do pedido</h2>
        <ul className="mb-4 flex flex-col gap-3">
          {items.map((i) => (
            <li key={`${i.productId}-${i.flavor}`} className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {i.quantity}x {i.name}
                {i.flavor ? ` (${i.flavor})` : ""}
              </span>
              <span className="shrink-0">{formatBRL(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frete</span>
            <span className="text-right">{delivery === "retirada" ? "Retirada no local" : "A combinar"}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-heading text-lg font-bold">
            <span>Total</span>
            <span className="text-primary text-glow-pink">{formatBRL(total)}</span>
          </div>
          {delivery === "entrega" && (
            <p className="text-xs text-muted-foreground">
              O valor do frete é combinado pelo WhatsApp de acordo com a sua localização.
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="mt-5 w-full bg-emerald-500 text-white hover:bg-emerald-600"
        >
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          Enviar pedido via WhatsApp
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Você será redirecionado ao WhatsApp para confirmar o pedido.
        </p>
      </aside>
    </form>
  )
}
