export const CATEGORIES = [
  { slug: "descartaveis", name: "Descartaveis" },
  { slug: "pods", name: "Pods / Vapes" },
  { slug: "essencias", name: "Essencias" },
  { slug: "acessorios", name: "Acessorios" },
] as const

export const ORDER_STATUSES = [
  "Recebido",
  "Em analise",
  "Preparando",
  "Saiu para entrega",
  "Concluido",
  "Cancelado",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_COLORS: Record<string, string> = {
  Recebido: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "Em analise": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Preparando: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Saiu para entrega": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Concluido: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Cancelado: "bg-rose-500/15 text-rose-400 border-rose-500/30",
}

export const REGIONS = [
  "Sao Luis - MA",
  "Sao Jose de Ribamar - MA",
  "Raposa - MA",
  "Paco do Lumiar - MA",
]

export const ADVANTAGES = [
  { title: "Atendimento rapido", desc: "Resposta agil no WhatsApp para tirar duvidas e fechar pedidos." },
  { title: "Entrega rapida", desc: "Receba seu pedido com agilidade em toda a regiao metropolitana." },
  { title: "Diversos modelos", desc: "Catalogo recheado de pods, vapes e essencias das melhores marcas." },
  { title: "Atendimento em toda regiao", desc: "Cobrimos Sao Luis e cidades vizinhas com seguranca e discricao." },
]
