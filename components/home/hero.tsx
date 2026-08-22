import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Camera, MapPin, Truck } from "lucide-react"
import { HeroWhatsappButton } from "@/components/home/hero-whatsapp-button"

type Contact = { number: string; label: string }

export function Hero({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-20">
        <div className="flex flex-col items-start gap-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <MapPin className="size-4" aria-hidden="true" /> São Luís — Maranhão
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">Seu vape. Seu estilo. Seu momento.</p>
            <h1 className="max-w-3xl font-heading text-4xl font-black uppercase leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Seu próximo <span className="text-primary">favorito</span> está aqui
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">Pods, vapes e essências originais com atendimento rápido e entrega em São Luís.</p>
          </div>

          <div className="grid w-full gap-3 sm:max-w-xl sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-card p-4">
              <Truck className="size-6 shrink-0 text-primary" />
              <div>
                <p className="font-bold text-foreground">Entrega por R$ 8</p>
                <p className="text-sm text-muted-foreground">Taxa fixa nos bairros de SLZ</p>
              </div>
            </div>
            <a href="https://instagram.com/vapormaxoficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
              <Camera className="size-6 shrink-0 text-primary" />
              <div>
                <p className="font-bold text-foreground">@vapormaxoficial</p>
                <p className="text-sm text-muted-foreground">Siga nosso Instagram</p>
              </div>
            </a>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button render={<Link href="/catalogo" />} size="lg" className="min-h-12 px-6">Ver catálogo <ArrowRight data-icon="inline-end" /></Button>
            <HeroWhatsappButton contacts={contacts} />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-primary/35 bg-card shadow-2xl lg:max-w-none">
          <div className="absolute left-4 top-4 z-10 rounded-full bg-background/85 px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur-md">Vapor Max SLZ</div>
          <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5]">
            <Image src="/images/vapor-max-instagram.png" alt="Vapor Max — pods, vapes e essências em São Luís" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-top" />
          </div>
        </div>
      </div>
    </section>
  )
}
