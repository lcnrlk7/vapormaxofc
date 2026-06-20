import { getAllProductsAdmin } from "@/lib/data"
import { ProductManager } from "@/components/admin/product-manager"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin()
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          {products.length} produtos cadastrados. Edite preços, estoque e imagens sem mexer no código.
        </p>
      </header>
      <ProductManager products={products} />
    </div>
  )
}
