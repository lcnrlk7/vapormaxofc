import { CheckoutForm } from "@/components/checkout/checkout-form"
import { getSettings } from "@/lib/data"

export const dynamic = "force-dynamic"
export const metadata = { title: "Finalizar pedido | Vapor Max" }

export default async function CheckoutPage() {
  const settings = await getSettings()
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold md:text-3xl">Finalizar pedido</h1>
      <CheckoutForm
        whatsappNumber={settings.whatsapp_number}
        defaultGateway={settings.default_gateway ?? "promisepay"}
      />
    </div>
  )
}
