import Link from "next/link"
import { Cigarette, Battery, Droplets, Package } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"

const ICONS: Record<string, typeof Cigarette> = {
  descartaveis: Cigarette,
  pods: Battery,
  essencias: Droplets,
  acessorios: Package,
}

export function CategoryGrid({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">Navegue por categoria</h2>
        <p className="mt-2 text-muted-foreground">Encontre rápido o que você procura</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.slug] ?? Package
          return (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/60 hover:shadow-[0_0_25px_-5px_rgba(255,45,149,0.4)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{counts[cat.slug] ?? 0} produtos</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
