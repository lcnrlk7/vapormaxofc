"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { paymentLinks, type PaymentLinkItem } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Nao autorizado")
  return session.user.id
}

export type PaymentLinkInput = {
  customerName: string
  customerPhone: string
  location: string
  notes: string
  items: PaymentLinkItem[]
  deliveryFee: number // cents
}

function randomToken() {
  // URL-safe token, ~16 chars
  return Array.from({ length: 16 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
  ).join("")
}

export async function createPaymentLink(input: PaymentLinkInput) {
  await requireAdmin()

  const items = input.items.filter((i) => i.quantity > 0)
  if (items.length === 0) throw new Error("Adicione ao menos um produto")

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const deliveryFee = Math.max(0, Math.round(input.deliveryFee || 0))
  const total = subtotal + deliveryFee
  const token = randomToken()

  await db.insert(paymentLinks).values({
    token,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.replace(/\D/g, ""),
    location: input.location.trim(),
    notes: input.notes.trim(),
    items: JSON.stringify(items),
    subtotal,
    deliveryFee,
    total,
    status: "pendente",
  })

  revalidatePath("/admin/links")
  return { ok: true as const, token }
}

export async function deletePaymentLink(id: number) {
  await requireAdmin()
  await db.delete(paymentLinks).where(eq(paymentLinks.id, id))
  revalidatePath("/admin/links")
  return { ok: true as const }
}

export async function setPaymentLinkStatus(id: number, status: string) {
  await requireAdmin()
  await db.update(paymentLinks).set({ status, updatedAt: new Date() }).where(eq(paymentLinks.id, id))
  revalidatePath("/admin/links")
  return { ok: true as const }
}

export async function listPaymentLinks() {
  await requireAdmin()
  return db.select().from(paymentLinks).orderBy(desc(paymentLinks.createdAt))
}
