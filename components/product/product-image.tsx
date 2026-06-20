"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const PLACEHOLDER = "/product-placeholder.png"

export function ProductImage({
  src,
  alt,
  className,
  sizes,
}: {
  src?: string | null
  alt: string
  className?: string
  sizes?: string
}) {
  const [error, setError] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const resolved = !src || error ? PLACEHOLDER : src

  // Catch images that failed to load before React attached the onError handler
  // (SSR hydration race) — if the natural size is 0 after load, fall back.
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) {
      setError(true)
    }
  }, [resolved])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={resolved || "/placeholder.svg"}
      alt={alt}
      loading="lazy"
      sizes={sizes}
      onError={() => setError(true)}
      className={cn("object-cover", className)}
    />
  )
}
