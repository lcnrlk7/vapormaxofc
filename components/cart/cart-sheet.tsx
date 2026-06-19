"use client"

import { useCart } from "@/components/cart/cart-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/format"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"

export function CartSheet() {
  const { items, isOpen, setOpen, subtotal, count, updateQuantity, removeItem } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-lg">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Meu carrinho
            {count > 0 && <span className="text-sm text-muted-foreground">({count})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Seu carrinho esta vazio.</p>
            <Button asChild variant="secondary" onClick={() => setOpen(false)}>
              <Link href="/catalogo">Ver catalogo</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.flavor}`} className="flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">{item.name}</p>
                      {item.flavor && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.flavor}</p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-primary">{formatBRL(item.unitPrice)}</p>
                      <div className="mt-auto flex items-center gap-2 pt-2">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            aria-label="Diminuir"
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                            onClick={() => updateQuantity(item.productId, item.flavor, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm">{item.quantity}</span>
                          <button
                            aria-label="Aumentar"
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                            onClick={() => updateQuantity(item.productId, item.flavor, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          aria-label="Remover item"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.productId, item.flavor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-heading text-lg font-bold">{formatBRL(subtotal)}</span>
              </div>
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground glow-pink hover:bg-primary/90"
                onClick={() => setOpen(false)}
              >
                <Link href="/checkout">Finalizar pedido</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
