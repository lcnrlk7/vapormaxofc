"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES } from "@/lib/constants"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const SORTS = [
  { value: "recent", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "name", label: "Nome (A-Z)" },
]

export function CatalogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const activeCat = params.get("categoria") ?? "todos"
  const activeSort = params.get("sort") ?? "recent"
  const [search, setSearch] = useState(params.get("search") ?? "")

  useEffect(() => {
    setSearch(params.get("search") ?? "")
  }, [params])

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "todos" || (key === "sort" && value === "recent")) sp.delete(key)
      else sp.set(key, value)
    }
    router.push(`${pathname}?${sp.toString()}`)
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    update({ search: search.trim() || null })
  }

  const cats = [{ slug: "todos", name: "Todos" }, ...CATEGORIES]

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, marca ou sabor..."
          className="border-border bg-secondary pl-9"
        />
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.slug}
              onClick={() => update({ categoria: c.slug })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeCat === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-foreground/70 hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <Select value={activeSort} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger className="w-full border-border bg-secondary sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
