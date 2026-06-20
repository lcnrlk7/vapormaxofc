import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { paymentLinks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getPaymentLinkByToken } from "@/lib/data"
import { createPixCharge, isGatewayConfigured } from "@/lib/promissepay"

// Cria a cobrança PIX para o link de pagamento e retorna o QR Code.
export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token?: string }
    if (!token) return NextResponse.json({ error: "Token ausente" }, { status: 400 })

    const link = await getPaymentLinkByToken(token)
    if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    if (link.status === "pago") return NextResponse.json({ error: "Pedido já pago" }, { status: 409 })
    if (link.status === "cancelado") return NextResponse.json({ error: "Link cancelado" }, { status: 409 })

    if (!isGatewayConfigured()) {
      return NextResponse.json({ pending: true }, { status: 200 })
    }

    if (link.total < 50) {
      return NextResponse.json({ error: "Valor mínimo não atingido" }, { status: 400 })
    }

    const charge = await createPixCharge(link.total)

    // Guarda a referência da transação para acompanhar o status depois.
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
