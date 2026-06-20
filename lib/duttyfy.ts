import "server-only"

const DEFAULT_DOCUMENT = "61674069367"

function getEncryptedUrl() {
  const url = process.env.DUTTYFY_PIX_URL_ENCRYPTED
  if (!url) throw new Error("DUTTYFY_PIX_URL_ENCRYPTED não configurada")
  return url
}

export function isDuttyfyConfigured() {
  return !!process.env.DUTTYFY_PIX_URL_ENCRYPTED
}

function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "")
}

// A Duttyfy exige 10 ou 11 dígitos (DDD + número). Remove o código do país (55).
function normalizePhone(value: string) {
  let digits = onlyDigits(value)
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2)
  }
  // Se ainda passar de 11 (ex.: zeros à esquerda), mantém os 11 últimos.
  if (digits.length > 11) digits = digits.slice(-11)
  return digits
}

async function postWithRetry(url: string, body: unknown, attempt = 1): Promise<Response> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    // Retry only on 5xx
    if (res.status >= 500 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
      return postWithRetry(url, body, attempt + 1)
    }
    return res
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
      return postWithRetry(url, body, attempt + 1)
    }
    throw err
  }
}

export type DuttyfyCharge = {
  transactionId: string
  pixCode: string
  status: string
}

export async function createDuttyfyCharge(params: {
  amountCents: number
  title: string
  customerName: string
  customerPhone: string
  utm?: string
}): Promise<DuttyfyCharge> {
  const url = getEncryptedUrl()
  const phone = normalizePhone(params.customerPhone)
  const name = (params.customerName || "Cliente").trim()
  // E-mail é obrigatório pela gateway; geramos um placeholder válido.
  const email = `cliente${phone || Date.now()}@vapormax.com`

  const body = {
    amount: params.amountCents,
    customer: {
      name,
      document: DEFAULT_DOCUMENT,
      email,
      phone: phone || "11999999999",
    },
    item: {
      title: params.title,
      price: params.amountCents,
      quantity: 1,
    },
    paymentMethod: "PIX",
    ...(params.utm ? { utm: params.utm } : {}),
  }

  const res = await postWithRetry(url, body)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.log("[v0] Duttyfy charge error", res.status, text.slice(0, 200), "url:", url.slice(-8))
    throw new Error("Falha ao gerar a cobrança PIX")
  }
  const data = (await res.json()) as { pixCode?: string; transactionId?: string; status?: string }
  if (!data.pixCode || !data.transactionId) {
    throw new Error("Resposta inválida da adquirente")
  }
  return { transactionId: data.transactionId, pixCode: data.pixCode, status: data.status || "PENDING" }
}

export async function getDuttyfyStatus(transactionId: string): Promise<{ paid: boolean; status: string }> {
  const url = getEncryptedUrl()
  const res = await fetch(`${url}?transactionId=${encodeURIComponent(transactionId)}`, {
    method: "GET",
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return { paid: false, status: "PENDING" }
  const data = (await res.json()) as { status?: string }
  const status = data.status || "PENDING"
  return { paid: status === "COMPLETED", status }
}
