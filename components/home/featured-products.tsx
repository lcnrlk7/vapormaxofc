import Link from "next/link"
import type { Product } from "@/lib/db/schema"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Mais procurados</h2>
          <p className="mt-2 text-muted-foreground">Os queridinhos da galera</p>
        </div>
        <Button asChild variant="ghost" className="shrink-0 text-primary hover:text-primary">
          <Link href="/catalogo">
            Ver tudo <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
