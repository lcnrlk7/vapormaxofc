"use server"

import { db } from "@/lib/db"
import { orders, orderItems, products } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type CartItemInput = {
  productId: number
  productName: string
  flavor: string
  unitPrice: number
  quantity: number
}

export type CreateOrderInput = {
  customerName: string
  customerPhone: string
  customerEmail?: string
  address?: string
  city?: string
  notes?: string
  deliveryMethod: "entrega" | "retirada"
  paymentMethod: string
  deliveryFee: number
  items: CartItemInput[]
  // "site" gera cobrança PIX na página de pagamento; "whatsapp" mantém o fluxo antigo.
  paymentFlow?: "site" | "whatsapp"
  gateway?: string
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.customerName?.trim() || !input.customerPhone?.trim()) {
    return { ok: false as const, error: "Nome e telefone sao obrigatorios." }
  }
  if (!input.items?.length) {
    return { ok: false as const, error: "Carrinho vazio." }
  }

  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const deliveryFee = input.deliveryMethod === "entrega" ? input.deliveryFee : 0
  const total = subtotal + deliveryFee
  const orderNumber = `VM${Date.now().toString().slice(-8)}`
  const isSiteFlow = input.paymentFlow === "site"

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail?.trim() ?? "",
      address: input.address?.trim() ?? "",
      city: input.city?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      subtotal,
      deliveryFee,
      total,
      // Pagamento pelo site começa aguardando o PIX; pelo WhatsApp já entra como recebido.
      status: isSiteFlow ? "Aguardando pagamento" : "Recebido",
      gateway: isSiteFlow ? input.gateway || "promisepay" : "",
    })
    .returning()

  await db.insert(orderItems).values(
    input.items.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productName: i.productName,
      flavor: i.flavor ?? "",
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.unitPrice * i.quantity,
    })),
  )

  // Decrement stock (best-effort, never below 0).
  for (const i of input.items) {
    await db
      .update(products)
      .set({ stock: sql`GREATEST(${products.stock} - ${i.quantity}, 0)` })
      .where(eq(products.id, i.productId))
  }

  revalidatePath("/admin")
  revalidatePath("/admin/pedidos")

  return { ok: true as const, orderNumber, orderId: order.id, total }
}
