"use client"

import { useState } from "react"
import type { Order, OrderItem } from "@/lib/db/schema"
import { updateOrderStatus } from "@/app/actions/admin"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatBRL, formatDateTime } from "@/lib/format"
import { ORDER_STATUSES, STATUS_COLORS } from "@/lib/constants"
import { Search, Eye, Phone, MapPin, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type OrderWithItems = Order & { items: OrderItem[] }

export function OrderManager({ orders }: { orders: OrderWithItems[] }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [selected, setSelected] = useState<OrderWithItems | null>(null)
  const [list, setList] = useState(orders)

  const filtered = list.filter((o) => {
    const matchesQuery =
      !query ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerPhone.includes(query)
    const matchesStatus = statusFilter === "todos" || o.status === statusFilter
    return matchesQuery && matchesStatus
  })

  async function changeStatus(id: number, status: string) {
    setList((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    setSelected((s) => (s && s.id === id ? { ...s, status } : s))
    const res = await updateOrderStatus(id, status)
    if (res.ok) toast.success("Status atualizado")
    else toast.error("Erro ao atualizar status")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, número ou telefone..."
            className="border-border bg-card pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full border-border bg-card sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Data</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {formatDateTime(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatBRL(o.total)}</td>
                  <td className="px-4 py-3">
                    <Select value={o.status} onValueChange={(v) => changeStatus(o.id, v)}>
                      <SelectTrigger
                        className={cn("h-8 w-auto gap-1 border px-2.5 text-xs", STATUS_COLORS[o.status])}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(o)}
                      className="inline-flex items-center text-muted-foreground hover:text-primary"
                      aria-label="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto border-border bg-card sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">Pedido {selected.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={STATUS_COLORS[selected.status]}>
                    {selected.status}
                  </Badge>
                  <span className="text-muted-foreground">{formatDateTime(selected.createdAt)}</span>
                </div>

                <div className="space-y-1.5 rounded-lg border border-border p-3">
                  <p className="font-medium">{selected.customerName}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {selected.customerPhone}
                  </p>
                  {selected.deliveryMethod === "entrega" ? (
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {selected.address}
                      {selected.city ? `, ${selected.city}` : ""}
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-3.5 w-3.5" /> Retirada no local
                    </p>
                  )}
                  <p className="text-muted-foreground">Pagamento: {selected.paymentMethod}</p>
                  {selected.notes && <p className="text-muted-foreground">Obs: {selected.notes}</p>}
                </div>

                <ul className="space-y-2">
                  {selected.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-2">
                      <span>
                        {it.quantity}x {it.productName}
                        {it.flavor ? <span className="text-muted-foreground"> ({it.flavor})</span> : null}
                      </span>
                      <span className="shrink-0">{formatBRL(it.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-1 border-t border-border pt-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBRL(selected.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>
                      {selected.deliveryMethod === "retirada"
                        ? "Retirada no local"
                        : selected.deliveryFee === 0
                          ? "A combinar"
                          : formatBRL(selected.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-heading text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatBRL(selected.total)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Atualizar status</label>
                  <Select value={selected.status} onValueChange={(v) => changeStatus(selected.id, v)}>
                    <SelectTrigger className="border-border bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
