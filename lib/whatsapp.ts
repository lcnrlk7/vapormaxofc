export function waLink(number: string, message?: string): string {
  const clean = (number || "").replace(/\D/g, "")
  const base = `https://wa.me/${clean}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

// Saudação conforme o horário de Brasília (America/Sao_Paulo).
export function brasiliaGreeting(date: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      hour12: false,
    }).format(date),
  )
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

type OrderMessageItem = {
  quantity: number
  productName: string
  flavor?: string | null
}

type OrderMessageInput = {
  customerName: string
  orderNumber: string
  items: OrderMessageItem[]
  total: string // já formatado em BRL
}

// Mensagem de confirmação de pedido, com saudação automática.
export function buildOrderConfirmationMessage(order: OrderMessageInput): string {
  const greeting = brasiliaGreeting()
  const firstName = (order.customerName || "").trim().split(" ")[0] || "tudo bem"
  const itemsList = order.items
    .map((it) => `• ${it.quantity}x ${it.productName}${it.flavor ? ` (${it.flavor})` : ""}`)
    .join("\n")

  return [
    `${greeting}, ${firstName}! Tudo bem?`,
    ``,
    `Aqui é da *Vapor Max*. Vimos que você iniciou um pedido (${order.orderNumber}) e gostaríamos de saber se tem interesse em confirmá-lo. 😊`,
    ``,
    `*Resumo do pedido:*`,
    itemsList,
    ``,
    `*Total: ${order.total}*`,
    ``,
    `Posso confirmar e seguir com a entrega? Qualquer dúvida estou à disposição!`,
  ].join("\n")
}
