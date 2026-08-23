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
  gateway: string
}

function randomToken() {
  // URL-safe token, ~16 chars
  return Array.from({ length: 16 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
  ).join("")
}

export async function createPaymentLink(input: PaymentLinkInput) {
  try {
    await requireAdmin()

    const items = input.items.filter(
      (item) =>
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isInteger(item.unitPrice) &&
        item.unitPrice >= 0,
    )
    if (items.length === 0) {
      return { ok: false as const, error: "Adicione ao menos um produto válido." }
    }

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const deliveryFee = Math.max(0, Math.round(input.deliveryFee || 0))
    const total = subtotal + deliveryFee
    const token = randomToken()
    const allowedGateways = ["promisepay", "duttyfy", "hyperionpay"]
    const gateway = allowedGateways.includes(input.gateway) ? input.gateway : "promisepay"

    if (!Number.isSafeInteger(total) || total <= 0) {
      return { ok: false as const, error: "O valor total do link deve ser maior que zero." }
    }

    if (gateway === "hyperionpay" && (total < 100 || total > 5_000_000)) {
      return {
        ok: false as const,
        error: "Links da Hyperion Pay 2.0 devem ter valor entre R$ 1,00 e R$ 50.000,00.",
      }
    }

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
      gateway,
    })

    revalidatePath("/admin/links")
    return { ok: true as const, token }
  } catch (error) {
    const message = error instanceof Error && error.message === "Nao autorizado"
      ? "Sua sessão expirou. Entre novamente no painel administrativo."
      : "Não foi possível gerar o link agora. Tente novamente."
    return { ok: false as const, error: message }
  }
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
