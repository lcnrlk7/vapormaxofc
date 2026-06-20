import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number
  size?: number
  className?: string
}) {
  return (
    <div className={cn("flex items-center", className)} aria-label={`${value} de 5 estrelas`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)) // 0..1 para preenchimento parcial
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-muted-foreground/40" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star
                className="text-amber-400"
                style={{ width: size, height: size, fill: "currentColor" }}
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}
