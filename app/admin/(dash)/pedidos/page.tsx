import { getOrdersWithItems } from "@/lib/data"
import { OrderManager } from "@/components/admin/order-manager"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await getOrdersWithItems()
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe e atualize o status dos pedidos.</p>
      </header>
      <OrderManager orders={orders} />
    </div>
  )
}
