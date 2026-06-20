import { checkGatewayStatus } from "@/app/actions/gateways"
import { GatewayManager } from "@/components/admin/gateway-manager"

export const dynamic = "force-dynamic"

export default async function AdminGatewaysPage() {
  const statuses = await checkGatewayStatus()

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header>
        <h1 className="font-heading text-2xl font-bold">Gateways de pagamento</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as integrações de pagamento usadas nos links de cobrança.
        </p>
      </header>

      <GatewayManager initialStatuses={statuses} />
    </div>
  )
}
