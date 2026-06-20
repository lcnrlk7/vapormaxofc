import { getCustomers, getSettings } from "@/lib/data"
import { formatBRL, formatDateTime } from "@/lib/format"
import { waLink } from "@/lib/whatsapp"
import { MessageCircle, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  const [customers, settings] = await Promise.all([getCustomers(), getSettings()])
  const sorted = [...customers].sort((a, b) => b.totalSpent - a.totalSpent)

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">{customers.length} clientes que já fizeram pedidos.</p>
      </header>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum cliente ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Cidade</th>
                  <th className="px-4 py-3 font-medium">Pedidos</th>
                  <th className="px-4 py-3 font-medium">Total gasto</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Último pedido</th>
                  <th className="px-4 py-3 text-right font-medium">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((c) => (
                  <tr key={c.phone} className="hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{c.city || "-"}</td>
                    <td className="px-4 py-3">{c.orderCount}</td>
                    <td className="px-4 py-3 font-semibold">{formatBRL(c.totalSpent)}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {formatDateTime(c.lastOrder)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={waLink(settings.whatsapp_number, `Olá ${c.name}! Aqui é da Vapor Max.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-emerald-400 hover:text-emerald-300"
                        aria-label={`Falar com ${c.name}`}
                      >
                        <MessageCircle className="h-4.5 w-4.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
