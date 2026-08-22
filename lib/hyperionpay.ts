import "server-only"

const BASE_URL = "https://hyperionpay.com.br"
const MIN_PIX_AMOUNT_CENTS = 100
const MAX_PIX_AMOUNT_CENTS = 5_000_000

function getAuthHeaders() {
  const clientId = process.env.HYPERIONPAY_CLIENT_ID?.trim()
  const clientSecret = process.env.HYPERIONPAY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error("HYPERIONPAY_CLIENT_ID/HYPERIONPAY_CLIENT_SECRET não configurados")
  }

  // A API documenta Basic Auth, mas o gateway atualmente só reconhece
  // de forma consistente os headers separados.
  return {
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
  }
}

export function isHyperionConfigured() {
  return Boolean(process.env.HYPERIONPAY_CLIENT_ID && process.env.HYPERIONPAY_CLIENT_SECRET)
}

export type HyperionPixResult = {
  transactionId: string
  pixCode: string
  qrCodeBase64: string
}

// amountCents -> reais com 2 casas
function centsToReais(amountCents: number) {
  return Math.round(amountCents) / 100
}

export async function createHyperionPix(params: {
  amountCents: number
  externalId: string
  description?: string
  customerName?: string
}): Promise<HyperionPixResult> {
  if (!Number.isInteger(params.amountCents)) {
    throw new Error("O valor da cobrança deve ser informado em centavos inteiros")
  }
  if (params.amountCents < MIN_PIX_AMOUNT_CENTS || params.amountCents > MAX_PIX_AMOUNT_CENTS) {
    throw new Error("A cobrança PIX deve ter valor entre R$ 1,00 e R$ 50.000,00")
  }

  const payerName = params.customerName?.trim()
  const res = await fetch(`${BASE_URL}/api/v1/integration/pix`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: centsToReais(params.amountCents),
      external_id: params.externalId,
      description: params.description || "Pedido Vapor Max",
      ...(payerName ? { payer: { name: payerName } } : {}),
    }),
    cache: "no-store",
  })

  const json = await res.json().catch(() => ({}) as any)
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Falha ao gerar PIX (HTTP ${res.status})`)
  }

  const data = json.data || {}
  const pix = data.pix || {}
  const pixCode: string = pix.copy_paste || pix.qr_code || ""
  if (!pixCode) {
    throw new Error("Resposta da Hyperion sem código PIX")
  }

  return {
    transactionId: String(data.transaction_id || params.externalId),
    pixCode,
    qrCodeBase64: pix.qr_code_base64 || "",
  }
}

export async function getHyperionPixStatus(params: {
  transactionId?: string
  externalId?: string
}): Promise<{ paid: boolean; status: string }> {
  const query = params.transactionId
    ? `transaction_id=${encodeURIComponent(params.transactionId)}`
    : `external_id=${encodeURIComponent(params.externalId || "")}`

  const res = await fetch(`${BASE_URL}/api/v1/integration/pix?${query}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  })

  const json = await res.json().catch(() => ({}) as any)
  if (!res.ok || !json?.success) {
    return { paid: false, status: "pending" }
  }

  const status = String(json.data?.status || "pending").toLowerCase()
  const paid = status === "completed" || status === "paid" || status === "approved"
  return { paid, status }
}

export async function getHyperionBalance(): Promise<{ balanceCents: number; kycStatus: string } | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/integration/balance`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    })
    const json = await res.json().catch(() => ({}) as any)
    if (!res.ok || !json?.success) return null
    return {
      balanceCents: Math.round((json.data?.balance || 0) * 100),
      kycStatus: String(json.data?.kyc_status || ""),
    }
  } catch {
    return null
  }
}
