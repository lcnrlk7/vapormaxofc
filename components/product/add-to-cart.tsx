"use client"

import { useState } from "react"
import type { Product } from "@/lib/db/schema"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { flavorsToArray } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const flavors = flavorsToArray(product.flavors)
  const isPod = product.category === "pods"
  const [flavor, setFlavor] = useState(flavors[0] ?? "")
  const [qty, setQty] = useState(1)
  const outOfStock = product.stock <= 0 || product.soldOut

  function handleAdd() {
    if (outOfStock) return
    if (flavors.length > 0 && !flavor) {
      toast.error(isPod ? "Selecione uma cor" : "Selecione um sabor")
      return
    }
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image ?? "",
        flavor,
        unitPrice: product.price,
      },
      qty,
    )
    toast.success("Adicionado ao carrinho", { description: product.name })
  }

  return (
    <div className="flex flex-col gap-5">
      {flavors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            {isPod ? "Cor" : "Sabor"}{" "}
            <span className="text-muted-foreground">({flavors.length} opcoes)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {flavors.map((f) => (
              <button
                key={f}
                onClick={() => setFlavor(f)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  flavor === f
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary text-foreground/80 hover:border-primary/50",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-border">
          <button
            aria-label="Diminuir quantidade"
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-medium">{qty}</span>
          <button
            aria-label="Aumentar quantidade"
            className="px-3 py-2 text-muted-foreground hover:text-foreground"
            onClick={() => setQty((q) => q + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {outOfStock ? "Sem estoque" : `${product.stock} em estoque`}
        </p>
      </div>

      <Button
        onClick={handleAdd}
        disabled={outOfStock}
        size="lg"
        className="w-full bg-primary text-primary-foreground glow-pink hover:bg-primary/90"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {outOfStock ? "Produto esgotado" : "Adicionar ao carrinho"}
      </Button>
    </div>
  )
}
