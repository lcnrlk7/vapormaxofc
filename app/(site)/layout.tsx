import { Suspense } from "react"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { WhatsappFab } from "@/components/site/whatsapp-fab"
import { getSettings } from "@/lib/data"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<div className="h-16 border-b border-border" />}>
        <SiteHeader whatsappNumber={settings.whatsapp_number} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter
        whatsappNumber={settings.whatsapp_number}
        instagramUrl={settings.instagram_url}
        hours={settings.hours}
      />
      <WhatsappFab number={settings.whatsapp_number} />
    </div>
  )
}
