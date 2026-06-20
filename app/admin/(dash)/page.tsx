import Link from "next/link"
import { getDashboardStats, getOrders, getTopProducts } from "@/lib/data"
import { formatBRL } from "@/lib/format"
import { STATUS_COLORS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Clock, Package, Users, ArrowRight, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [stats, orders, topProducts] = await Promise.all([
    getDashboardStats(),
    getOrders(),
    getTopProducts(5),
  ])
  const recentOrders = orders.slice(0, 6)

  const cards = [
    { label: "Faturamento", value: formatBRL(stats.revenue), icon: DollarSign, accent: "text-emerald-400" },
    { label: "Pedidos", value: String(stats.totalOrders), icon: ShoppingCart, accent: "text-neon-blue" },
    { label: "Pendentes", value: String(stats.pending), icon: Clock, accent: "text-amber-400" },
    { label: "Produtos", value: String(stats.productsCount), icon: Package, accent: "text-neon-pink" },
    { label: "Clientes", value: String(stats.customersCount), icon: Users, accent: "text-violet-400" },
  ]

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua loja</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</span>
              <c.icon className={cn("h-4 w-4", c.accent)} />
            </div>
            <p className="mt-2 font-heading text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent orders */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-heading font-semibold">Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("hidden sm:inline-flex", STATUS_COLORS[o.status])}>
                      {o.status}
                    </Badge>
                    <span className="text-sm font-semibold">{formatBRL(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top products */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-semibold">Mais vendidos</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Sem vendas registradas.</p>
          ) : (
            <ul className="divide-y divide-border">
              {topProducts.map((p, i) => (
                <li key={p.productName} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm">{p.productName}</p>
                  <span className="text-sm text-muted-foreground">{p.qty} un.</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
