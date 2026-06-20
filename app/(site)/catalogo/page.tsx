import { Suspense } from "react"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { ProductCard } from "@/components/product/product-card"
import { getProducts } from "@/lib/data"
import { CATEGORIES } from "@/lib/constants"
import { PackageX } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; search?: string; sort?: string }>
}) {
  const sp = await searchParams
  const products = await getProducts({
    category: sp.categoria,
    search: sp.search,
    sort: sp.sort,
  })

  const categoryName = CATEGORIES.find((c) => c.slug === sp.categoria)?.name
  const title = sp.search
    ? `Resultados para "${sp.search}"`
    : categoryName ?? "Catálogo completo"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </div>

      <Suspense fallback={<div className="h-32" />}>
        <CatalogFilters />
      </Suspense>

      <div className="mt-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
            <PackageX className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
