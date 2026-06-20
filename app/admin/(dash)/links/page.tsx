import { getAllProductsAdmin } from "@/lib/data"
import { listPaymentLinks } from "@/app/actions/payment-links"
import { PaymentLinkManager } from "@/components/admin/payment-link-manager"

export const dynamic = "force-dynamic"

export default async function AdminLinksPage() {
  const [products, links] = await Promise.all([getAllProductsAdmin(), listPaymentLinks()])

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Links de pagamento</h1>
        <p className="text-sm text-muted-foreground">
          Monte um checkout com os produtos, frete e dados que o cliente passou no WhatsApp e gere um link para
          pagamento.
        </p>
      </header>
      <PaymentLinkManager products={products} links={links} />
    </div>
  )
}
