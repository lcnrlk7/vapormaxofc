import { db } from "@/lib/db"
import {
  products,
  orders,
  orderItems,
  settings,
  user,
  paymentLinks,
  type Product,
  type PaymentLink,
  type PaymentLinkItem,
} from "@/lib/db/schema"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"

export type { Product }

export async function getPaymentLinkByToken(
  token: string,
): Promise<(PaymentLink & { parsedItems: PaymentLinkItem[] }) | null> {
  try {
    const rows = await db.select().from(paymentLinks).where(eq(paymentLinks.token, token)).limit(1)
    const link = rows[0]
    if (!link) return null
    let parsedItems: PaymentLinkItem[] = []
    try {
      parsedItems = JSON.parse(link.items)
    } catch {
      parsedItems = []
    }
    return { ...link, parsedItems }
  } catch {
    return null
  }
}

export async function hasAdminUser(): Promise<boolean> {
  try {
    const rows = await db.select({ id: user.id }).from(user).limit(1)
    return rows.length > 0
  } catch {
    return true
  }
}

const DEFAULT_SETTINGS: Record<string, string> = {
  whatsapp_number: "5598000000000",
  whatsapp_number_2: "",
  whatsapp_label_1: "Atendimento SLZ Carlos",
  whatsapp_label_2: "Atendimento SLZ Eduardo",
  store_name: "Vapor Max",
  instagram_url: "https://instagram.com",
  delivery_fee: "500",
  hours: "Seg a Sab: 9h as 22h | Dom: 14h as 22h",
  free_delivery_min: "15000",
  default_gateway: "promisepay",
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(settings)
    const map = { ...DEFAULT_SETTINGS }
    for (const row of rows) map[row.key] = row.value
    return map
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export async function getProducts(opts?: {
  category?: string
  search?: string
  sort?: string
  featuredOnly?: boolean
  includeInactive?: boolean
}): Promise<Product[]> {
  const conditions = []
  if (!opts?.includeInactive) conditions.push(eq(products.active, true))
  if (opts?.category && opts.category !== "todos") {
    conditions.push(eq(products.category, opts.category))
  }
  if (opts?.featuredOnly) conditions.push(eq(products.featured, true))
  if (opts?.search) {
    const term = `%${opts.search}%`
    conditions.push(
      or(ilike(products.name, term), ilike(products.brand, term), ilike(products.flavors, term))!,
    )
  }

  let orderBy
  switch (opts?.sort) {
    case "price-asc":
      orderBy = products.price
      break
    case "price-desc":
      orderBy = desc(products.price)
      break
    case "name":
      orderBy = products.name
      break
    default:
      orderBy = desc(products.createdAt)
  }

  return db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getProductById(id: number): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getRelatedProducts(category: string, excludeId: number): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.category, category), eq(products.active, true)))
    .orderBy(desc(products.featured))
    .limit(8)
    .then((rows) => rows.filter((r) => r.id !== excludeId).slice(0, 4))
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ category: products.category, count: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.active, true))
    .groupBy(products.category)
  const map: Record<string, number> = {}
  for (const row of rows) map[row.category] = row.count
  return map
}

// ---------- Admin data ----------
export async function getAllProductsAdmin(): Promise<Product[]> {
  return db.select().from(products).orderBy(desc(products.createdAt))
}

export async function getOrders() {
  return db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function getOrdersWithItems() {
  const [orderRows, itemRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(orderItems),
  ])
  return orderRows.map((o) => ({
    ...o,
    items: itemRows.filter((it) => it.orderId === o.id),
  }))
}

export async function getOrderWithItems(id: number) {
  const order = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order[0]) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
  return { ...order[0], items }
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order[0]) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id))
  return { ...order[0], items }
}

export async function getDashboardStats() {
  const [orderRows, productRows] = await Promise.all([
    db.select().from(orders),
    db.select({ id: products.id }).from(products),
  ])

  const totalOrders = orderRows.length
  const pending = orderRows.filter((o) => !["Concluido", "Cancelado"].includes(o.status)).length
  const completed = orderRows.filter((o) => o.status === "Concluido").length
  const revenue = orderRows
    .filter((o) => o.status !== "Cancelado" && o.status !== "Aguardando pagamento")
    .reduce((sum, o) => sum + o.total, 0)
  const uniqueCustomers = new Set(orderRows.map((o) => o.customerPhone)).size

  return {
    totalOrders,
    pending,
    completed,
    productsCount: productRows.length,
    customersCount: uniqueCustomers,
    revenue,
  }
}

export async function getCustomers() {
  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt))
  const map = new Map<
    string,
    { name: string; phone: string; city: string; orderCount: number; totalSpent: number; lastOrder: Date }
  >()
  for (const o of orderRows) {
    const existing = map.get(o.customerPhone)
    if (existing) {
      existing.orderCount += 1
      if (o.status !== "Cancelado") existing.totalSpent += o.total
    } else {
      map.set(o.customerPhone, {
        name: o.customerName,
        phone: o.customerPhone,
        city: o.city ?? "",
        orderCount: 1,
        totalSpent: o.status !== "Cancelado" ? o.total : 0,
        lastOrder: o.createdAt,
      })
    }
  }
  return Array.from(map.values())
}

export async function getTopProducts(limit = 5) {
  const rows = await db
    .select({
      productName: orderItems.productName,
      qty: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<number>`sum(${orderItems.lineTotal})::int`,
    })
    .from(orderItems)
    .groupBy(orderItems.productName)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit)
  return rows
}
