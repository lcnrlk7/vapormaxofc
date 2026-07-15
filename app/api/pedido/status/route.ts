import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getOrderByNumber } from "@/lib/data"
import { getTransaction, isPaidStatus, isGatewayConfigured } from "@/lib/promissepay"
import { getDuttyfyStatus, isDuttyfyConfigured } from "@/lib/duttyfy"
import { getHyperionPixStatus, isHyperionConfigured } from "@/lib/hyperionpay"

// Consulta o status do pagamento de um pedido e marca como "Pago" quando aprovado.
export async function POST(req: Request) {
  try {
    const { orderNumber } = (await req.json()) as { orderNumber?: string }
    if (!orderNumber) return NextResponse.json({ error: "Pedido ausente" }, { status: 400 })

    const order = await getOrderByNumber(orderNumber)
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

    if (order.status === "Pago") return NextResponse.json({ paid: true })
    if (!order.gatewayRef) return NextResponse.json({ paid: false })

    const gateway = order.gateway || "promisepay"
    let paid = false

    if (gateway === "duttyfy") {
      if (!isDuttyfyConfigured()) return NextResponse.json({ paid: false })
      const status = await getDuttyfyStatus(order.gatewayRef)
      paid = status.paid
    } else if (gateway === "hyperionpay") {
      if (!isHyperionConfigured()) return NextResponse.json({ paid: false })
      const status = await getHyperionPixStatus({ transactionId: order.gatewayRef, externalId: order.orderNumber })
      paid = status.paid
    } else {
      if (!isGatewayConfigured()) return NextResponse.json({ paid: false })
      const tx = await getTransaction(order.gatewayRef)
      paid = isPaidStatus(tx.status)
    }

    if (paid) {
      await db.update(orders).set({ status: "Pago", updatedAt: new Date() }).where(eq(orders.id, order.id))
    }

    return NextResponse.json({ paid })
  } catch (err) {
    console.log("[v0] Erro ao consultar status do pedido:", err instanceof Error ? err.message : err)
    return NextResponse.json({ paid: false })
  }
}
