import { Hero } from "@/components/home/hero"
import { Features } from "@/components/home/features"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedProducts } from "@/components/home/featured-products"
import { RegionsCta } from "@/components/home/regions-cta"
import { getProducts, getCategoryCounts, getSettings } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featured, counts, settings] = await Promise.all([
    getProducts({ featuredOnly: true }),
    getCategoryCounts(),
    getSettings(),
  ])
  const whatsapp = settings.whatsapp_number

  return (
    <>
      <Hero whatsappNumber={whatsapp} />
      <Features />
      <CategoryGrid counts={counts} />
      <FeaturedProducts products={featured.slice(0, 8)} />
      <RegionsCta whatsappNumber={whatsapp} />
    </>
  )
}
