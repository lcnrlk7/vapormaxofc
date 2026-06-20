"use client"

import { useState } from "react"
import { saveSettings } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { centsToReaisInput, parseBRLToCents } from "@/lib/format"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [form, setForm] = useState({
    store_name: settings.store_name ?? "",
    whatsapp_number: settings.whatsapp_number ?? "",
    instagram_url: settings.instagram_url ?? "",
    hours: settings.hours ?? "",
    delivery_fee: centsToReaisInput(Number(settings.delivery_fee) || 0),
    free_delivery_min: centsToReaisInput(Number(settings.free_delivery_min) || 0),
  })
  const [saving, setSaving] = useState(false)

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await saveSettings({
      store_name: form.store_name,
      whatsapp_number: form.whatsapp_number.replace(/\D/g, ""),
      instagram_url: form.instagram_url,
      hours: form.hours,
      delivery_fee: String(parseBRLToCents(form.delivery_fee)),
      free_delivery_min: String(parseBRLToCents(form.free_delivery_min)),
    })
    setSaving(false)
    if (res.ok) toast.success("Configurações salvas")
    else toast.error("Erro ao salvar")
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading font-semibold">Loja</h2>
        <div className="space-y-1.5">
          <Label htmlFor="store_name">Nome da loja</Label>
          <Input id="store_name" value={form.store_name} onChange={(e) => set("store_name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hours">Horário de atendimento</Label>
          <Input id="hours" value={form.hours} onChange={(e) => set("hours", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="instagram">Instagram (URL)</Label>
          <Input id="instagram" value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading font-semibold">Contato &amp; WhatsApp</h2>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">Número do WhatsApp (com DDI e DDD)</Label>
          <Input
            id="whatsapp"
            placeholder="5598991234567"
            value={form.whatsapp_number}
            onChange={(e) => set("whatsapp_number", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Exemplo: 55 (Brasil) + 98 (DDD) + número. Os pedidos e o atendimento são enviados para este número.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading font-semibold">Entrega</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="delivery_fee">Taxa de entrega (R$)</Label>
            <Input
              id="delivery_fee"
              inputMode="decimal"
              value={form.delivery_fee}
              onChange={(e) => set("delivery_fee", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="free_min">Frete grátis a partir de (R$)</Label>
            <Input
              id="free_min"
              inputMode="decimal"
              value={form.free_delivery_min}
              onChange={(e) => set("free_delivery_min", e.target.value)}
            />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar configurações
      </Button>
    </form>
  )
}
