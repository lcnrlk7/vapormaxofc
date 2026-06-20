import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { waLink } from "@/lib/whatsapp"
import { MessageCircle, ArrowRight } from "lucide-react"

export function Hero({ whatsappNumber }: { whatsappNumber: string }) {
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
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={
              <a
                href={waLink(whatsappNumber, "Ola! Quero fazer um pedido na Vapor Max.")}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            size="lg"
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <MessageCircle className="mr-2 h-5 w-5 shrink-0" /> Falar no WhatsApp
          </Button>
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
