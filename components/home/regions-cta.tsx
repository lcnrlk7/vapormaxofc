import { Button } from "@/components/ui/button"
import { waLink } from "@/lib/whatsapp"
import { REGIONS } from "@/lib/constants"
import { MapPin, MessageCircle, Users } from "lucide-react"

export function RegionsCta({ whatsappNumber, groupUrl }: { whatsappNumber: string; groupUrl?: string }) {
  return (
    <section className="relative overflow-hidden border-y border-border bg-card/40">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(0,191,255,0.15), transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,45,149,0.15), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-14 text-center md:py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <MapPin className="h-7 w-7" />
        </div>
        <h2 className="font-heading text-2xl font-bold uppercase md:text-3xl text-balance">Somos de São Luís — MA</h2>
        <p className="max-w-xl text-pretty text-muted-foreground">
          Entrega rápida com taxa fixa de <span className="font-bold text-foreground">R$ 8 para bairros de São Luís</span>. Consulte o atendimento para outras regiões:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {REGIONS.map((r) => (
            <span
              key={r}
              className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-foreground"
            >
              {r}
            </span>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            render={
              <a
                href={waLink(whatsappNumber, "Olá! Gostaria de saber se entregam na minha região.")}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            size="lg"
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <MessageCircle className="mr-2 h-5 w-5 shrink-0" /> Consultar entrega
          </Button>
          {groupUrl ? (
            <Button
              render={<a href={groupUrl} target="_blank" rel="noopener noreferrer" />}
              size="lg"
              variant="outline"
              className="border-emerald-500/50 bg-transparent text-emerald-400 hover:bg-emerald-500/10"
            >
              <Users className="mr-2 h-5 w-5 shrink-0" /> Entrar no grupo
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
