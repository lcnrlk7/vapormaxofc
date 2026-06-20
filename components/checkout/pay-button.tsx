"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck } from "lucide-react"

export function PayButton({ token, amountLabel }: { token: string; amountLabel: string }) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    try {
      // Integração com a gateway PromissePay será conectada aqui.
      // Quando a API key e a documentação estiverem disponíveis, este
      // botão fará a chamada para criar a cobrança e redirecionar o cliente.
      const res = await fetch("/api/pagar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      if (res.ok) {
        const data = (await res.json()) as { url?: string }
        if (data.url) {
          window.location.href = data.url
          return
        }
      }
      toast.info("O pagamento online será ativado em breve. Confirme o pagamento pelo WhatsApp por enquanto.")
    } catch {
      toast.error("Não foi possível iniciar o pagamento agora.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePay}
        disabled={loading}
        className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground glow-pink hover:bg-primary/90"
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        Pagar {amountLabel}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Pagamento processado com segurança
      </p>
    </div>
  )
}
