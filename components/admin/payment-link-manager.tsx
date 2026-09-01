"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import type { Product, PaymentLink, Order, OrderItem } from "@/lib/db/schema"
import { createPaymentLink, deletePaymentLink, setPaymentLinkStatus } from "@/app/actions/payment-links"
import { formatBRL, parseBRLToCents, centsToReaisInput, formatDateTime, flavorsToArray } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Plus,
  Trash2,
  Minus,
  Copy,
  ExternalLink,
  Loader2,
  Link2,
  Check,
  MessageCircle,
  ShoppingBag,
} from "lucide-react"

type DraftItem = {
  uid: string
  productId: number | null
  name: string
  flavor: string
  image: string
  unitPrice: number
  quantity: number
  flavorsAvailable: string[]
}

type OrderWithItems = Order & { items: OrderItem[] }

const STATUS_STYLES: Record<string, string> = {
  pendente: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  pago: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  cancelado: "border-destructive/40 bg-destructive/10 text-destructive",
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
}

export function PaymentLinkManager({
  products,
  links,
  orders,
}: {
  products: Product[]
  links: PaymentLink[]
  orders: OrderWithItems[]
}) {
  const [items, setItems] = useState<DraftItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [deliveryFeeInput, setDeliveryFeeInput] = useState("")
  const [discountInput, setDiscountInput] = useState("")
  const [totalOverrideEnabled, setTotalOverrideEnabled] = useState(false)
  const [totalOverrideInput, setTotalOverrideInput] = useState("")
  const [gateway, setGateway] = useState("promisepay")
  const [sourceOrder, setSourceOrder] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<{ url: string; phone: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0), [items])
  const deliveryFee = parseBRLToCents(deliveryFeeInput)
  const discount = Math.min(parseBRLToCents(discountInput), subtotal + deliveryFee)
  const computedTotal = Math.max(0, subtotal + deliveryFee - discount)
  const totalOverride = parseBRLToCents(totalOverrideInput)
  const total = totalOverrideEnabled ? totalOverride : computedTotal

  function addProduct(productId: number) {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    if (items.some((i) => i.productId === productId)) {
      toast.info("Produto já adicionado. Ajuste a quantidade.")
      return
    }
    const flavorsAvailable = flavorsToArray(p.flavors)
    setItems((prev) => [
      ...prev,
      {
        uid: `p-${p.id}`,
        productId: p.id,
        name: p.name,
        flavor: flavorsAvailable[0] ?? "",
        image: p.image ?? "",
        unitPrice: p.price,
        quantity: 1,
        flavorsAvailable,
      },
    ])
  }

  function loadOrder(orderId: number) {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    setCustomerName(order.customerName ?? "")
    setCustomerPhone(order.customerPhone ?? "")
    setLocation([order.address, order.city].filter(Boolean).join(" - "))
    setNotes(order.notes ?? "")
    setItems(
      order.items.map((it) => {
        const p = it.productId ? products.find((x) => x.id === it.productId) : undefined
        const flavorsAvailable = p ? flavorsToArray(p.flavors) : it.flavor ? [it.flavor] : []
        return {
          uid: `o-${it.id}`,
          productId: it.productId ?? null,
          name: it.productName,
          flavor: it.flavor ?? "",
          image: p?.image ?? "",
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          flavorsAvailable,
        }
      }),
    )
    setSourceOrder(order.orderNumber)
    toast.success(`Pedido ${order.orderNumber} carregado. Falta só o frete.`)
  }

  function updateItem(uid: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, ...patch } : i)))
  }

  function removeItem(uid: string) {
    setItems((prev) => prev.filter((i) => i.uid !== uid))
  }

  function resetForm() {
    setItems([])
    setCustomerName("")
    setCustomerPhone("")
    setLocation("")
    setNotes("")
    setDeliveryFeeInput("")
    setDiscountInput("")
    setTotalOverrideEnabled(false)
    setTotalOverrideInput("")
    setSourceOrder(null)
  }

  async function handleGenerate() {
    if (items.length === 0) {
      toast.error("Adicione ao menos um produto.")
      return
    }
    if (total <= 0) {
      toast.error("O valor total deve ser maior que zero.")
      return
    }
    setSaving(true)
    setGenerated(null)
    const res = await createPaymentLink({
      customerName,
      customerPhone,
      location,
      notes,
      deliveryFee,
      discount,
      totalOverride: totalOverrideEnabled ? totalOverride : null,
      gateway,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        flavor: i.flavor,
        image: i.image,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    }).catch((e) => ({ ok: false as const, error: String(e?.message ?? e) }))
    setSaving(false)

    if (!res || !("ok" in res) || !res.ok) {
      toast.error(("error" in (res ?? {}) && (res as { error?: string }).error) || "Erro ao gerar link")
      return
    }
    const url = `${window.location.origin}/pagar/${res.token}`
    setGenerated({ url, phone: customerPhone.replace(/\D/g, "") })
    toast.success("Link gerado!")
    resetForm()
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copiado")
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    const res = await deletePaymentLink(id)
    setDeletingId(null)
    if (res.ok) toast.success("Link removido")
  }

  async function changeStatus(id: number, status: string) {
    const res = await setPaymentLinkStatus(id, status)
    if (res.ok) toast.success("Status atualizado")
  }

  function linkUrl(token: string) {
    if (typeof window === "undefined") return `/pagar/${token}`
    return `${window.location.origin}/pagar/${token}`
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(300px,380px)]">
      {/* Builder */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading font-semibold">Criar a partir de um pedido</h2>
              <p className="text-xs text-muted-foreground">
                Selecione um pedido para preencher os dados do cliente e os produtos. Depois é só informar o frete.
              </p>
            </div>
            {sourceOrder && (
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Pedido {sourceOrder}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <Select value="" onValueChange={(v) => loadOrder(Number(v))}>
                <SelectTrigger className="w-full">
                  <ShoppingBag className="h-4 w-4" />
                  <SelectValue placeholder="Selecionar pedido existente" />
                </SelectTrigger>
                <SelectContent>
                  {orders.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum pedido encontrado
                    </SelectItem>
                  ) : (
                    orders.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.orderNumber} — {o.customerName || "Sem nome"} ({formatBRL(o.total)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {sourceOrder && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Limpar
              </Button>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading font-semibold">Dados do cliente</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cname">Nome</Label>
              <Input id="cname" placeholder="Ex.: João" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cphone">WhatsApp</Label>
              <Input
                id="cphone"
                placeholder="Ex.: 5598999999999"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc">Localização / endereço de entrega</Label>
            <Textarea
              id="loc"
              placeholder="Endereço completo que o cliente passou no WhatsApp"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Input id="notes" placeholder="Ex.: entregar após 18h" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading font-semibold">Produtos</h2>
            <div className="w-full sm:w-64">
              <Select value="" onValueChange={(v) => addProduct(Number(v))}>
                <SelectTrigger className="w-full">
                  <Plus className="h-4 w-4" />
                  <SelectValue placeholder="Adicionar produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — {formatBRL(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Nenhum produto adicionado ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.uid}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                      {item.image ? (
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBRL(item.unitPrice)} / un.</p>
                      {item.flavorsAvailable.length > 0 && (
                        <div className="mt-1 w-40">
                          <Select value={item.flavor} onValueChange={(v) => updateItem(item.uid, { flavor: v })}>
                            <SelectTrigger size="sm" className="w-full">
                              <SelectValue placeholder="Sabor" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.flavorsAvailable.map((f) => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => updateItem(item.uid, { quantity: Math.max(1, item.quantity - 1) })}
                        className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateItem(item.uid, { quantity: item.quantity + 1 })}
                        className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="w-20 text-right text-sm font-semibold">
                      {formatBRL(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.uid)}
                      className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-destructive"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Existing links */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading font-semibold">Links gerados ({links.length})</h2>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum link gerado ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {links.map((link) => (
                <li key={link.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{link.customerName || "Sem nome"}</p>
                      <Badge variant="outline" className={cn(STATUS_STYLES[link.status] ?? STATUS_STYLES.pendente)}>
                        {STATUS_LABEL[link.status] ?? link.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBRL(link.total)} ·{" "}
                      {link.gateway === "duttyfy"
                        ? "Duttyfy"
                        : link.gateway === "hyperionpay"
                          ? "Hyperion Pay 2.0"
                          : "PromissePay"}{" "}
                      · {formatDateTime(link.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Select value={link.status} onValueChange={(v) => changeStatus(link.id, v)}>
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => copyLink(linkUrl(link.token))} aria-label="Copiar link">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      render={<a href={linkUrl(link.token)} target="_blank" rel="noopener noreferrer" />}
                      variant="ghost"
                      size="icon"
                      aria-label="Abrir link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.id)}
                      disabled={deletingId === link.id}
                      aria-label="Remover"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === link.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Summary / generate */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading font-semibold">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fee">Frete (R$)</Label>
              <Input
                id="fee"
                inputMode="decimal"
                placeholder="0,00"
                value={deliveryFeeInput}
                onChange={(e) => setDeliveryFeeInput(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input
                id="discount"
                inputMode="decimal"
                placeholder="0,00"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
              />
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Desconto aplicado</span>
                <span>- {formatBRL(discount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Label htmlFor="override" className="cursor-pointer text-muted-foreground">
                Definir valor total manualmente
              </Label>
              <Switch
                id="override"
                checked={totalOverrideEnabled}
                onCheckedChange={(checked) => {
                  setTotalOverrideEnabled(checked)
                  if (checked && !totalOverrideInput) {
                    setTotalOverrideInput((computedTotal / 100).toFixed(2).replace(".", ","))
                  }
                }}
              />
            </div>
            {totalOverrideEnabled ? (
              <div className="space-y-1.5">
                <Label htmlFor="total-override">Valor total (R$)</Label>
                <Input
                  id="total-override"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={totalOverrideInput}
                  onChange={(e) => setTotalOverrideInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Calculado: {formatBRL(computedTotal)}. O valor acima será cobrado no lugar.
                </p>
              </div>
            ) : null}

            <div className="flex justify-between border-t border-border pt-3 font-heading text-lg font-bold">
              <span>Total</span>
              <span className="text-primary text-glow-pink">{formatBRL(total)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gw">Gateway de pagamento</Label>
            <Select value={gateway} onValueChange={setGateway}>
              <SelectTrigger id="gw" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promisepay">PromissePay</SelectItem>
                <SelectItem value="duttyfy">Duttyfy</SelectItem>
                <SelectItem value="hyperionpay">Hyperion Pay 2.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={saving || items.length === 0}
            className="w-full bg-primary text-primary-foreground glow-pink hover:bg-primary/90"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
            Gerar link de pagamento
          </Button>

          {generated && (
            <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-xs font-medium text-emerald-400">Link gerado com sucesso</p>
              <div className="flex items-center gap-2 rounded-md border border-border bg-background p-2">
                <span className="min-w-0 flex-1 truncate text-xs">{generated.url}</span>
                <button
                  onClick={() => copyLink(generated.url)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  render={<a href={generated.url} target="_blank" rel="noopener noreferrer" />}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Abrir
                </Button>
                {generated.phone && (
                  <Button
                    render={
                      <a
                        href={`https://wa.me/${generated.phone}?text=${encodeURIComponent(
                          `Olá! Segue o link para pagamento do seu pedido na Vapor Max: ${generated.url}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    size="sm"
                    className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" /> Enviar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
