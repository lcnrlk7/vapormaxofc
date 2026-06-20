import { getProductRating } from "@/lib/reviews"
import { StarRating } from "@/components/product/star-rating"
import { UserRound } from "lucide-react"

function timeAgo(days: number) {
  if (days <= 1) return "ontem"
  if (days < 7) return `há ${days} dias`
  if (days < 30) {
    const w = Math.floor(days / 7)
    return `há ${w} ${w === 1 ? "semana" : "semanas"}`
  }
  const m = Math.floor(days / 30)
  return `há ${m} ${m === 1 ? "mês" : "meses"}`
}

export function ProductReviews({ productId }: { productId: number }) {
  const { average, count, reviews } = getProductRating(productId)

  // Distribuição visual (barras) coerente com a média.
  const dist = [5, 4, 3, 2, 1].map((star) => {
    let pct: number
    if (star === 5) pct = Math.min(100, Math.round(average * 16))
    else if (star === 4) pct = Math.max(6, Math.round((5 - average) * 70))
    else if (star === 3) pct = Math.max(2, Math.round((5 - average) * 24))
    else pct = star === 2 ? 3 : 2
    return { star, pct }
  })

  return (
    <section className="mt-12">
      <h2 className="mb-5 font-heading text-xl font-bold md:text-2xl">Avaliações dos clientes</h2>

      <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[auto_1fr] sm:gap-8 md:p-6">
        {/* Resumo */}
        <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-border sm:pr-8">
          <span className="font-heading text-5xl font-extrabold text-foreground">
            {average.toFixed(1).replace(".", ",")}
          </span>
          <StarRating value={average} size={18} className="mt-2 gap-0.5" />
          <span className="mt-1 text-sm text-muted-foreground">{count} avaliações</span>
        </div>

        {/* Barras de distribuição */}
        <div className="flex flex-col justify-center gap-1.5">
          {dist.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 text-right">{star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comentários (sem nome) */}
      <ul className="mt-5 space-y-3">
        {reviews.map((r, idx) => (
          <li key={idx} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">Cliente verificado</span>
                  <StarRating value={r.stars} size={12} />
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">{timeAgo(r.daysAgo)}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
