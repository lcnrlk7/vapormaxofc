import { Suspense } from "react"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { WhatsappFab } from "@/components/site/whatsapp-fab"
import { AgeGate } from "@/components/site/age-gate"
import { GroupInvitePopup } from "@/components/site/group-invite-popup"
import { InstagramWelcome } from "@/components/site/instagram-welcome"
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
        groupUrl={settings.whatsapp_group_url}
      />
      <WhatsappFab contacts={[{ number: settings.whatsapp_number, label: settings.whatsapp_label_1 }]} />
      <AgeGate />
      <InstagramWelcome instagramUrl={settings.instagram_url} />
      <GroupInvitePopup groupUrl={settings.whatsapp_group_url} />
    </div>
  )
}
