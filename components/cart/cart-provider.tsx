"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type CartItem = {
  productId: number
  name: string
  slug: string
  image: string
  flavor: string
  unitPrice: number // cents
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  setOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: number, flavor: string) => void
  updateQuantity: (productId: number, flavor: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = "vapormax_cart_v1"

function keyOf(productId: number, flavor: string) {
  return `${productId}__${flavor}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => keyOf(i.productId, i.flavor) === keyOf(item.productId, item.flavor))
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, { ...item, quantity }]
    })
    setOpen(true)
  }

  function removeItem(productId: number, flavor: string) {
    setItems((prev) => prev.filter((i) => keyOf(i.productId, i.flavor) !== keyOf(productId, flavor)))
  }

  function updateQuantity(productId: number, flavor: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          keyOf(i.productId, i.flavor) === keyOf(productId, flavor)
            ? { ...i, quantity: Math.max(1, quantity) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    )
  }

  function clear() {
    setItems([])
  }

  const { count, subtotal } = useMemo(() => {
    return {
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    }
  }, [items])

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, isOpen, setOpen, addItem, removeItem, updateQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider")
  return ctx
}
