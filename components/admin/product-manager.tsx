"use client"

import { useState } from "react"
import type { Product } from "@/lib/db/schema"
import { saveProduct, deleteProduct, type ProductInput } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES } from "@/lib/constants"
import { formatBRL, centsToReaisInput, parseBRLToCents } from "@/lib/format"
import { Plus, Pencil, Trash2, Search, Loader2, Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FormState = {
  id?: number
  name: string
  category: string
  brand: string
  description: string
  priceInput: string
  image: string
  puffs: string
  nicotine: string
  flavors: string
  stock: string
  featured: boolean
  active: boolean
}

const EMPTY: FormState = {
  name: "",
  category: "descartaveis",
  brand: "",
  description: "",
  priceInput: "",
  image: "",
  puffs: "",
  nicotine: "",
  flavors: "",
  stock: "0",
  featured: false,
  active: true,
}

export function ProductManager({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState("todos")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = products.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(query.toLowerCase())
    const matchesCat = catFilter === "todos" || p.category === catFilter
    return matchesQuery && matchesCat
  })

  function openNew() {
    setForm(EMPTY)
    setOpen(true)
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand ?? "",
      description: p.description ?? "",
      priceInput: centsToReaisInput(p.price),
      image: p.image ?? "",
      puffs: p.puffs ?? "",
      nicotine: p.nicotine ?? "",
      flavors: p.flavors ?? "",
      stock: String(p.stock),
      featured: p.featured,
      active: p.active,
    })
    setOpen(true)
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Informe o nome do produto.")
      return
    }
    setSaving(true)
    const payload: ProductInput = {
      id: form.id,
      name: form.name,
      category: form.category,
      brand: form.brand,
      description: form.description,
      price: parseBRLToCents(form.priceInput),
      image: form.image,
      images: "",
      puffs: form.puffs,
      nicotine: form.nicotine,
      flavors: form.flavors,
      stock: Number.parseInt(form.stock) || 0,
      featured: form.featured,
      active: form.active,
    }
    const res = await saveProduct(payload)
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(form.id ? "Produto atualizado" : "Produto criado")
    setOpen(false)
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(p.id)
    const res = await deleteProduct(p.id)
    setDeletingId(null)
    if (res.ok) toast.success("Produto excluído")
    else toast.error("Erro ao excluir")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="border-border bg-card pl-9"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full border-border bg-card sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1 h-4 w-4" /> Novo produto
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {p.featured && <Star className="h-3 w-3 fill-neon-blue text-neon-blue" />}
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 font-semibold">{formatBRL(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(p.stock <= 0 && "text-destructive", p.stock > 0 && p.stock <= 5 && "text-amber-400")}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        p.active
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {p.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        aria-label="Excluir"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{form.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Nome *</Label>
              <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="border-border bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-brand">Marca</Label>
                <Input id="p-brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Preço (R$) *</Label>
                <Input
                  id="p-price"
                  inputMode="decimal"
                  placeholder="59,90"
                  value={form.priceInput}
                  onChange={(e) => set("priceInput", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-stock">Estoque</Label>
                <Input
                  id="p-stock"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-image">URL da imagem</Label>
              <Input
                id="p-image"
                placeholder="https://..."
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
              />
              {form.image && (
                <div className="mt-2 h-24 w-24 overflow-hidden rounded-md border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image || "/placeholder.svg"} alt="Pré-visualização" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-puffs">Puffs</Label>
                <Input id="p-puffs" placeholder="5000 puffs" value={form.puffs} onChange={(e) => set("puffs", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-nic">Nicotina</Label>
                <Input id="p-nic" placeholder="5%" value={form.nicotine} onChange={(e) => set("nicotine", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-flavors">Sabores / Cores (separados por vírgula)</Label>
              <Textarea
                id="p-flavors"
                rows={2}
                value={form.flavors}
                onChange={(e) => set("flavors", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Descrição</Label>
              <Textarea id="p-desc" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>

            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Destaque
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Ativo (visível na loja)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
