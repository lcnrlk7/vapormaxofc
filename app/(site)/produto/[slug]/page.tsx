import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getProductBySlug, getRelatedProducts } from "@/lib/data"
import { AddToCart } from "@/components/product/add-to-cart"
import { ProductCard } from "@/components/product/product-card"
import { formatBRL } from "@/lib/format"
import { CATEGORIES } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Zap, Droplets, Tag } from "lucide-react"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Produto não encontrado | Vapor Max" }
  return {
    title: `${product.name} | Vapor Max`,
    description: product.description || `${product.name} disponível na Vapor Max.`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product || !product.active) notFound()

  const related = await getRelatedProducts(product.category, product.id)
  const categoryName = CATEGORIES.find((c) => c.slug === product.category)?.name ?? product.category

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Início</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/catalogo?categoria=${product.category}`} className="hover:text-foreground">
          {categoryName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
          {product.featured && (
            <span className="absolute left-3 top-3 rounded-md bg-neon-blue px-2.5 py-1 text-xs font-bold uppercase text-accent-foreground glow-blue">
              Destaque
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm uppercase tracking-wide text-muted-foreground">
            {product.brand || categoryName}
          </span>
          <h1 className="mt-1 font-heading text-2xl font-bold md:text-3xl text-balance">{product.name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.puffs && (
              <Badge variant="outline" className="gap-1 border-primary/40 text-foreground">
                <Zap className="h-3.5 w-3.5 text-neon-pink" /> {product.puffs}
              </Badge>
            )}
            {product.nicotine && (
              <Badge variant="outline" className="gap-1 border-primary/40 text-foreground">
                <Droplets className="h-3.5 w-3.5 text-neon-blue" /> Nicotina {product.nicotine}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1 border-border text-muted-foreground">
              <Tag className="h-3.5 w-3.5" /> {categoryName}
            </Badge>
          </div>

          <p className="mt-5 font-heading text-3xl font-extrabold text-primary text-glow-pink">
            {formatBRL(product.price)}
          </p>

          {product.description && (
            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-6">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-heading text-xl font-bold md:text-2xl">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
