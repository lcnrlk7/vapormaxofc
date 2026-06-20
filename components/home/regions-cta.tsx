import { Button } from "@/components/ui/button"
import { waLink } from "@/lib/whatsapp"
import { REGIONS } from "@/lib/constants"
import { MapPin, MessageCircle } from "lucide-react"

export function RegionsCta({ whatsappNumber }: { whatsappNumber: string }) {
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
        <h2 className="font-heading text-2xl font-bold md:text-3xl text-balance">Entregamos em toda a região</h2>
        <p className="max-w-xl text-pretty text-muted-foreground">
          Atendemos com agilidade e discrição. Confira as regiões que cobrimos:
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
        <Button asChild size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600">
          <a
            href={waLink(whatsappNumber, "Olá! Gostaria de saber se entregam na minha região.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" /> Consultar entrega
          </a>
        </Button>
      </div>
    </section>
  )
}
