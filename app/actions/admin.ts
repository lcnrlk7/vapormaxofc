"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, orders, settings } from "@/lib/db/schema"
import { slugify } from "@/lib/format"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Nao autorizado")
  return session.user.id
}

export type ProductInput = {
  id?: number
  name: string
  category: string
  brand: string
  description: string
  price: number // cents
  compareAtPrice?: number | null
  image: string
  images: string
  puffs: string
  nicotine: string
  flavors: string
  stock: number
  featured: boolean
  active: boolean
}

export async function saveProduct(input: ProductInput) {
  await requireAdmin()
  if (!input.name?.trim()) return { ok: false as const, error: "Nome obrigatorio." }

  const slug = slugify(input.name) || `produto-${Date.now()}`
  const values = {
    name: input.name.trim(),
    slug,
    category: input.category || "descartaveis",
    brand: input.brand ?? "",
    description: input.description ?? "",
    price: input.price ?? 0,
    compareAtPrice: input.compareAtPrice ?? null,
    image: input.image ?? "",
    images: input.images ?? "",
    puffs: input.puffs ?? "",
    nicotine: input.nicotine ?? "",
    flavors: input.flavors ?? "",
    stock: input.stock ?? 0,
    featured: input.featured ?? false,
    active: input.active ?? true,
    updatedAt: new Date(),
  }

  if (input.id) {
    await db.update(products).set(values).where(eq(products.id, input.id))
  } else {
    await db.insert(products).values(values)
  }

  revalidatePath("/admin/produtos")
  revalidatePath("/catalogo")
  revalidatePath("/")
  return { ok: true as const }
}

export async function deleteProduct(id: number) {
  await requireAdmin()
  await db.delete(products).where(eq(products.id, id))
  revalidatePath("/admin/produtos")
  revalidatePath("/catalogo")
  return { ok: true as const }
}

export async function updateOrderStatus(id: number, status: string) {
  await requireAdmin()
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id))
  revalidatePath("/admin/pedidos")
  revalidatePath("/admin")
  return { ok: true as const }
}

export async function saveSettings(values: Record<string, string>) {
  await requireAdmin()
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
  }
  revalidatePath("/admin/configuracoes")
  revalidatePath("/")
  return { ok: true as const }
}
