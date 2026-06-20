"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { checkGatewayStatus, type GatewayStatus } from "@/app/actions/gateways"
import { formatBRL } from "@/lib/format"
import { CreditCard, CheckCircle2, XCircle, RefreshCw, Loader2, Wallet, AlertTriangle } from "lucide-react"

export function GatewayManager({ initialStatuses }: { initialStatuses: GatewayStatus[] }) {
  const [statuses, setStatuses] = useState(initialStatuses)
  const [pending, startTransition] = useTransition()

  function handleTest() {
    startTransition(async () => {
      try {
        const next = await checkGatewayStatus()
        setStatuses(next)
        const anyConnected = next.some((g) => g.connected)
        if (anyConnected) toast.success("Conexão verificada!")
        else toast.error("Nenhuma gateway conectada.")
      } catch {
        toast.error("Não foi possível testar a conexão.")
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleTest} disabled={pending} variant="outline" className="bg-transparent">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Testar conexões
        </Button>
      </div>

      {statuses.map((gw) => (
        <div key={gw.id} className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Cabeçalho do gateway */}
          <div className="flex items-center gap-4 border-b border-border p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-lg font-semibold">{gw.name}</h2>
              <p className="text-sm text-muted-foreground">{gw.description}</p>
            </div>
            {gw.connected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
              </span>
            ) : gw.configured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Falha
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" /> Não configurado
              </span>
            )}
          </div>

          {/* Corpo */}
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Credencial</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  {gw.configured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Configurada
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" /> Não definida
                    </>
                  )}
                </p>
              </div>
              {gw.hasBalance ? (
                <div className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5" /> Saldo disponível
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {gw.balanceAvailable !== null ? formatBRL(Math.round(gw.balanceAvailable * 100)) : "—"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Método</p>
                  <p className="mt-1 text-sm font-medium">PIX</p>
                </div>
              )}
            </div>

            {!gw.configured && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                A credencial ({gw.envVar}) não está definida nas variáveis de ambiente do projeto.
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Selecione esta gateway ao criar um link de pagamento. Os clientes não veem o nome da gateway no checkout.
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
