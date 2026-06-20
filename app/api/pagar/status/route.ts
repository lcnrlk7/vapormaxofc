import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { paymentLinks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getPaymentLinkByToken } from "@/lib/data"
import { getTransaction, isPaidStatus, isGatewayConfigured } from "@/lib/promissepay"

// Consulta o status do pagamento de um link e atualiza para "pago" quando aprovado.
export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token?: string }
    if (!token) return NextResponse.json({ error: "Token ausente" }, { status: 400 })

    const link = await getPaymentLinkByToken(token)
    if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })

    if (link.status === "pago") return NextResponse.json({ paid: true })
    if (!isGatewayConfigured() || !link.gatewayRef) {
      return NextResponse.json({ paid: false })
    }

    const tx = await getTransaction(link.gatewayRef)
    const paid = isPaidStatus(tx.status)

    if (paid) {
      await db
        .update(paymentLinks)
        .set({ status: "pago", updatedAt: new Date() })
        .where(eq(paymentLinks.id, link.id))
    }

    return NextResponse.json({ paid })
  } catch (err) {
    console.log("[v0] Erro ao consultar status:", err instanceof Error ? err.message : err)
    return NextResponse.json({ paid: false })
  }
}
