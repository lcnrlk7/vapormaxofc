import Link from "next/link"
import Image from "next/image"
import { waLink } from "@/lib/whatsapp"
import { REGIONS } from "@/lib/constants"
import { MessageCircle, Camera, Clock, MapPin, Users } from "lucide-react"

export function SiteFooter({
  whatsappNumber,
  instagramUrl,
  hours,
  groupUrl,
}: {
  whatsappNumber: string
  instagramUrl: string
  hours: string
  groupUrl?: string
}) {
  return (
    <footer className="mt-20 border-t border-border bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Image src="/logo-vapormax.png" alt="Vapor Max" width={44} height={44} className="h-11 w-auto drop-shadow-[0_0_12px_rgba(255,45,149,0.4)]" />
            <span className="font-heading text-xl font-extrabold tracking-wide">
              VAPOR<span className="text-neon-pink">MAX</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Pods, vapes e essências originais em São Luís — MA. Entrega com taxa fixa de R$ 8 nos bairros da cidade.
          </p>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Contato</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <li>
              <a
                href={waLink(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Camera className="h-4 w-4" /> @vapormaxoficial
              </a>
            </li>
            {groupUrl ? (
              <li>
                <a
                  href={groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400"
                >
                  <Users className="h-4 w-4" /> Grupo no WhatsApp
                </a>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {hours}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Regioes atendidas</h3>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            {REGIONS.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neon-blue" /> {r}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Navegacao</h3>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Inicio</Link></li>
            <li><Link href="/catalogo" className="hover:text-foreground">Catalogo</Link></li>
            <li><Link href="/catalogo?categoria=descartaveis" className="hover:text-foreground">Descartaveis</Link></li>
            <li><Link href="/admin" className="hover:text-foreground">Area administrativa</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} Vapor Max. Todos os direitos reservados.</p>
          <p>Venda proibida para menores de 18 anos.</p>
        </div>
      </div>
    </footer>
  )
}
