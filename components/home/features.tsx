import { Truck, ShieldCheck, Clock, BadgePercent } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Entrega Rápida",
    desc: "Receba seu pedido com agilidade na sua região.",
  },
  {
    icon: ShieldCheck,
    title: "Produtos Originais",
    desc: "Trabalhamos apenas com marcas e produtos autênticos.",
  },
  {
    icon: Clock,
    title: "Atendimento Ágil",
    desc: "Suporte direto pelo WhatsApp todos os dias.",
  },
  {
    icon: BadgePercent,
    title: "Melhores Preços",
    desc: "Promoções e combos com os melhores valores.",
  },
]

export function Features() {
  return (
    <section className="border-y border-border bg-card/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 md:grid-cols-4 md:gap-6 md:py-14">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
              <f.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
