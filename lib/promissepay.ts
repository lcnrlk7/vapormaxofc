import "server-only"

const BASE_URL = "https://api.promisse.com.br"

function getApiKey() {
  const key = process.env.PROMISEPAY_API_KEY
  if (!key) throw new Error("PROMISEPAY_API_KEY não configurada")
  return key
}

export function isGatewayConfigured() {
  return Boolean(process.env.PROMISEPAY_API_KEY)
}

export type CreatedTransaction = {
  id: string
  status: string
  amount: number
  qrCodeBase64: string
  copyPaste: string
  expiresAt?: string
}

export type TransactionStatus = {
  id: string
  status: string
  amount: number
  copyPaste?: string
  qrCodeBase64?: string
}

export type GatewayBalance = {
  balance_available: number
  balance_locked: number
  totalBalances: number
  netBalance: number
}

/** Cria uma cobrança PIX. `amount` em centavos. */
export async function createPixCharge(amount: number, webhook?: string): Promise<CreatedTransaction> {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(webhook ? { amount, webhook } : { amount }),
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Falha ao criar cobrança (${res.status}): ${text}`)
  }
  return (await res.json()) as CreatedTransaction
}

/** Consulta o status de uma cobrança pelo id. */
export async function getTransaction(id: string): Promise<TransactionStatus> {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    headers: { Authorization: getApiKey() },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Falha ao consultar cobrança (${res.status}): ${text}`)
  }
  return (await res.json()) as TransactionStatus
}

/** Consulta o saldo da conta. Retorna null se a conexão falhar. */
export async function getBalance(): Promise<GatewayBalance | null> {
  try {
    const res = await fetch(`${BASE_URL}/balance`, {
      method: "POST",
      headers: { Authorization: getApiKey() },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as { balance?: GatewayBalance }
    return data.balance ?? null
  } catch {
    return null
  }
}

/** Considera o pagamento aprovado para os status retornados pela gateway. */
export function isPaidStatus(status: string | undefined) {
  if (!status) return false
  return ["paid", "approved", "completed"].includes(status.toLowerCase())
}
