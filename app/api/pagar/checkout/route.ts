import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { paymentLinks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getPaymentLinkByToken } from "@/lib/data"
import { createPixCharge, isGatewayConfigured } from "@/lib/promissepay"
import { createDuttyfyCharge, isDuttyfyConfigured } from "@/lib/duttyfy"
import { createHyperionPix, isHyperionConfigured } from "@/lib/hyperionpay"

// Cria a cobrança PIX para o link de pagamento e retorna o QR Code.
export async function POST(req: Request) {
  try {
    const { token, utm } = (await req.json()) as { token?: string; utm?: string }
    if (!token) return NextResponse.json({ error: "Token ausente" }, { status: 400 })

    const link = await getPaymentLinkByToken(token)
    if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    if (link.status === "pago") return NextResponse.json({ error: "Pedido já pago" }, { status: 409 })
    if (link.status === "cancelado") return NextResponse.json({ error: "Link cancelado" }, { status: 409 })

    if (link.total < 100) {
      return NextResponse.json({ error: "Valor mínimo de R$ 1,00 não atingido" }, { status: 400 })
    }

    const gateway = link.gateway || "promisepay"
    if (gateway === "hyperionpay" && link.total > 5_000_000) {
      return NextResponse.json({ error: "Valor máximo da Hyperion Pay 2.0 é R$ 50.000,00" }, { status: 400 })
    }

    if (gateway === "duttyfy") {
      if (!isDuttyfyConfigured()) {
        return NextResponse.json({ pending: true }, { status: 200 })
      }
      const itemTitle =
        link.parsedItems[0]?.name && link.parsedItems.length === 1
          ? link.parsedItems[0].name
          : `Pedido Vapor Max (${link.parsedItems.length} itens)`

      const charge = await createDuttyfyCharge({
        amountCents: link.total,
        title: itemTitle || "Pedido Vapor Max",
        customerName: link.customerName,
        customerPhone: link.customerPhone,
        utm,
      })

      const qrCodeBase64 = await QRCode.toDataURL(charge.pixCode, { margin: 1, width: 320 })

      await db
        .update(paymentLinks)
        .set({ gatewayRef: charge.transactionId, updatedAt: new Date() })
        .where(eq(paymentLinks.id, link.id))

      return NextResponse.json({
        transactionId: charge.transactionId,
        qrCodeBase64,
        copyPaste: charge.pixCode,
      })
    }

    if (gateway === "hyperionpay") {
      if (!isHyperionConfigured()) {
        return NextResponse.json({ pending: true }, { status: 200 })
      }
      const itemTitle =
        link.parsedItems[0]?.name && link.parsedItems.length === 1
          ? link.parsedItems[0].name
          : `Pedido Vapor Max (${link.parsedItems.length} itens)`

      const charge = await createHyperionPix({
        amountCents: link.total,
        externalId: link.token,
        description: itemTitle || "Pedido Vapor Max",
        customerName: link.customerName,
      })

      const qrCodeBase64 = charge.qrCodeBase64 || (await QRCode.toDataURL(charge.pixCode, { margin: 1, width: 320 }))

      await db
        .update(paymentLinks)
        .set({ gatewayRef: charge.transactionId, updatedAt: new Date() })
        .where(eq(paymentLinks.id, link.id))

      return NextResponse.json({
        transactionId: charge.transactionId,
        qrCodeBase64,
        copyPaste: charge.pixCode,
      })
    }

    // Padrão: PromissePay
    if (!isGatewayConfigured()) {
      return NextResponse.json({ pending: true }, { status: 200 })
    }

    const charge = await createPixCharge(link.total)
    await db
      .update(paymentLinks)
      .set({ gatewayRef: charge.id, updatedAt: new Date() })
      .where(eq(paymentLinks.id, link.id))

    return NextResponse.json({
      transactionId: charge.id,
      qrCodeBase64: charge.qrCodeBase64,
      copyPaste: charge.copyPaste,
      expiresAt: charge.expiresAt ?? null,
    })
  } catch (err) {
    console.log("[v0] Erro ao criar cobrança PIX:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Não foi possível gerar o pagamento agora." }, { status: 500 })
  }
}
