"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useCart } from "@/components/cart/cart-provider"
import { CartSheet } from "@/components/cart/cart-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { waLink } from "@/lib/whatsapp"
import { ShoppingCart, Search, Menu, MessageCircle } from "lucide-react"

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/catalogo?categoria=descartaveis", label: "Descartaveis" },
  { href: "/catalogo?categoria=pods", label: "Pods" },
  { href: "/catalogo?categoria=essencias", label: "Essencias" },
]

export function SiteHeader({ whatsappNumber }: { whatsappNumber: string }) {
  const { count, setOpen } = useCart()
  const router = useRouter()
  const params = useSearchParams()
  const [search, setSearch] = useState(params.get("search") ?? "")
  const [menuOpen, setMenuOpen] = useState(false)

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/catalogo?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Mobile menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-border bg-card">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex shrink-0 items-center" aria-label="Vapor Max - inicio">
          <Image
            src="/logo-horizontal.png"
            alt="Vapor Max"
            width={130}
            height={52}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-xs flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="border-border bg-secondary pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Button asChild variant="ghost" size="icon" className="text-emerald-400" aria-label="WhatsApp">
            <a href={waLink(whatsappNumber, "Ola! Vim pelo site da Vapor Max.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Abrir carrinho"
            onClick={() => setOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground glow-pink">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
      <CartSheet />
    </header>
  )
}
