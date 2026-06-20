"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/db/schema"
import { useCart } from "@/components/cart/cart-provider"
import { ProductImage } from "@/components/product/product-image"
import { Button } from "@/components/ui/button"
import { formatBRL, flavorsToArray } from "@/lib/format"
import { CATEGORIES } from "@/lib/constants"
import { Plus, Zap } from "lucide-react"
import { toast } from "sonner"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const router = useRouter()
  const flavors = flavorsToArray(product.flavors)
  const categoryName = CATEGORIES.find((c) => c.slug === product.category)?.name ?? product.category
  const outOfStock = product.stock <= 0 || product.soldOut

  function handleAdd() {
    if (outOfStock) return
    if (flavors.length > 1) {
      router.push(`/produto/${product.slug}`)
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image ?? "",
      flavor: flavors[0] ?? "",
      unitPrice: product.price,
    })
    toast.success("Adicionado ao carrinho", { description: product.name })
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <Link href={`/produto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-secondary">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-2 top-2 rounded-md bg-neon-blue px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground glow-blue">
            Destaque
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[1px]">
            <span className="-rotate-6 rounded-md border-2 border-destructive bg-destructive/15 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-destructive">
              Esgotado
            </span>
          </div>
        )}
        {product.puffs && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
            <Zap className="h-3 w-3 text-neon-pink" />
            {product.puffs}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.brand || categoryName}</span>
        <Link href={`/produto/${product.slug}`} className="mt-0.5 line-clamp-2 text-sm font-medium leading-tight hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-heading text-lg font-bold text-primary text-glow-pink">
            {formatBRL(product.price)}
          </span>
        </div>
        <Button
          onClick={handleAdd}
          disabled={outOfStock}
          size="sm"
          className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-1 h-4 w-4" />
          {flavors.length > 1 ? "Escolher" : "Solicitar"}
        </Button>
      </div>
    </div>
  )
}
