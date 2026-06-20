import { NextResponse } from "next/server"
import { getPaymentLinkByToken } from "@/lib/data"

// Endpoint que iniciará a cobrança na gateway PromissePay.
// Enquanto a API key (PROMISEPAY_API_KEY) e a documentação não estiverem
// configuradas, retornamos sem URL para o cliente confirmar pelo WhatsApp.
export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token?: string }
    if (!token) return NextResponse.json({ error: "Token ausente" }, { status: 400 })

    const link = await getPaymentLinkByToken(token)
    if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 })
    if (link.status === "pago") return NextResponse.json({ error: "Pedido já pago" }, { status: 409 })

    const apiKey = process.env.PROMISEPAY_API_KEY
    if (!apiKey) {
      // Gateway ainda não configurada.
      return NextResponse.json({ url: null, pending: true })
    }

    // TODO: criar cobrança na PromissePay usando `apiKey` e `link.total`,
    // e retornar a URL de checkout: return NextResponse.json({ url })
    return NextResponse.json({ url: null, pending: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
