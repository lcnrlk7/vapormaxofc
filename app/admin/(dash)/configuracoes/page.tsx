import { getSettings } from "@/lib/data"
import { SettingsForm } from "@/components/admin/settings-form"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Ajuste informações da loja, WhatsApp e entrega.</p>
      </header>
      <SettingsForm settings={settings} />
    </div>
  )
}
