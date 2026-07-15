import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Truck } from "lucide-react"
import { HeroWhatsappButton } from "@/components/home/hero-whatsapp-button"

type Contact = { number: string; label: string }

export function Hero({ contacts }: { contacts: Contact[] }) {
  return (
    <section className="relative overflow-hidden border-b border-border neon-grid">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-neon-blue/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-neon-pink/20 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center md:py-24">
        <Image
          src="/logo-vapormax.png"
          alt="Vapor Max"
          width={220}
          height={220}
          priority
          className="h-40 w-40 animate-float-slow drop-shadow-[0_0_35px_rgba(255,45,149,0.5)] md:h-56 md:w-56"
        />
        <div className="space-y-4">
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-balance md:text-6xl">
            Sua experiencia <span className="text-neon-pink text-glow-pink">VAPOR</span> no{" "}
            <span className="text-neon-blue text-glow-blue">MAX</span>
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            Pods descartaveis, vapes e essencias das melhores marcas. Atendimento e entrega rapida em toda a regiao
            de Sao Luis - MA.
          </p>
          <div className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-4 py-2 text-sm text-foreground">
            <Truck className="h-4 w-4 shrink-0 text-neon-blue" aria-hidden />
            <p className="text-pretty">
              Estamos em <span className="font-semibold">Sao Luis - MA</span> e enviamos pelos Correios para baixadas
              e interiores que tenham agencia dos Correios.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <HeroWhatsappButton contacts={contacts} />
          <Button
            render={<Link href="/catalogo" />}
            size="lg"
            variant="outline"
            className="border-primary/50 bg-transparent hover:bg-primary/10"
          >
            Ver catalogo <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  )
}
