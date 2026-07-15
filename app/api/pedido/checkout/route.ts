import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getOrderByNumber } from "@/lib/data"
import { createPixCharge, isGatewayConfigured } from "@/lib/promissepay"
import { createDuttyfyCharge, isDuttyfyConfigured } from "@/lib/duttyfy"
import { createHyperionPix, isHyperionConfigured } from "@/lib/hyperionpay"

// Gera a cobrança PIX para um pedido feito pelo site e retorna o QR Code.
export async function POST(req: Request) {
  try {
    const { orderNumber, utm } = (await req.json()) as { orderNumber?: string; utm?: string }
    if (!orderNumber) return NextResponse.json({ error: "Pedido ausente" }, { status: 400 })

    const order = await getOrderByNumber(orderNumber)
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    if (order.status === "Pago") return NextResponse.json({ error: "Pedido já pago" }, { status: 409 })
    if (order.status === "Cancelado") return NextResponse.json({ error: "Pedido cancelado" }, { status: 409 })

    if (order.total < 100) {
      return NextResponse.json({ error: "Valor mínimo de R$ 1,00 não atingido" }, { status: 400 })
    }

    const gateway = order.gateway || "promisepay"
    const itemTitle =
      order.items.length === 1 && order.items[0]?.productName
        ? order.items[0].productName
        : `Pedido Vapor Max (${order.items.length} itens)`

    if (gateway === "duttyfy") {
      if (!isDuttyfyConfigured()) return NextResponse.json({ pending: true }, { status: 200 })
      const charge = await createDuttyfyCharge({
        amountCents: order.total,
        title: itemTitle,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        utm,
      })
      const qrCodeBase64 = await QRCode.toDataURL(charge.pixCode, { margin: 1, width: 320 })
      await db
        .update(orders)
        .set({ gatewayRef: charge.transactionId, updatedAt: new Date() })
        .where(eq(orders.id, order.id))
      return NextResponse.json({
        transactionId: charge.transactionId,
        qrCodeBase64,
        copyPaste: charge.pixCode,
      })
    }

    if (gateway === "hyperionpay") {
      if (!isHyperionConfigured()) return NextResponse.json({ pending: true }, { status: 200 })
      const charge = await createHyperionPix({
        amountCents: order.total,
        externalId: order.orderNumber,
        description: itemTitle,
        customerName: order.customerName,
      })
      const qrCodeBase64 = charge.qrCodeBase64 || (await QRCode.toDataURL(charge.pixCode, { margin: 1, width: 320 }))
      await db
        .update(orders)
        .set({ gatewayRef: charge.transactionId, updatedAt: new Date() })
        .where(eq(orders.id, order.id))
      return NextResponse.json({
        transactionId: charge.transactionId,
        qrCodeBase64,
        copyPaste: charge.pixCode,
      })
    }

    // Padrão: PromissePay
    if (!isGatewayConfigured()) return NextResponse.json({ pending: true }, { status: 200 })
    const charge = await createPixCharge(order.total)
    await db
      .update(orders)
      .set({ gatewayRef: charge.id, updatedAt: new Date() })
      .where(eq(orders.id, order.id))
    return NextResponse.json({
      transactionId: charge.id,
      qrCodeBase64: charge.qrCodeBase64,
      copyPaste: charge.copyPaste,
      expiresAt: charge.expiresAt ?? null,
    })
  } catch (err) {
    console.log("[v0] Erro ao gerar PIX do pedido:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Não foi possível gerar o pagamento agora." }, { status: 500 })
  }
}
