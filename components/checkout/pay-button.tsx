"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Copy, Check, QrCode, CheckCircle2 } from "lucide-react"

type PixData = {
  transactionId: string
  qrCodeBase64: string
  copyPaste: string
}

export function PayButton({ token, amountLabel }: { token: string; amountLabel: string }) {
  const [loading, setLoading] = useState(false)
  const [pix, setPix] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [paid, setPaid] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  async function handlePay() {
    setLoading(true)
    try {
      const utm = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : ""
      const res = await fetch("/api/pagar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, utm }),
      })
      const data = (await res.json()) as PixData & { pending?: boolean; error?: string }

      if (data.pending) {
        toast.info("O pagamento online estará disponível em instantes. Tente novamente.")
        return
      }
      if (!res.ok || !data.qrCodeBase64) {
        toast.error(data.error || "Não foi possível gerar o pagamento.")
        return
      }

      setPix({ transactionId: data.transactionId, qrCodeBase64: data.qrCodeBase64, copyPaste: data.copyPaste })
      startPolling()
    } catch {
      toast.error("Não foi possível iniciar o pagamento agora.")
    } finally {
      setLoading(false)
    }
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/pagar/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = (await res.json()) as { paid?: boolean }
        if (data.paid) {
          setPaid(true)
          if (pollRef.current) clearInterval(pollRef.current)
          toast.success("Pagamento confirmado!")
        }
      } catch {
        // silencioso; tenta de novo no próximo ciclo
      }
    }, 4000)
  }

  async function handleCopy() {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.copyPaste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Não foi possível copiar.")
    }
  }

  if (paid) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">Pagamento confirmado. Obrigado pela compra!</p>
      </div>
    )
  }

  if (pix) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <QrCode className="h-4 w-4 text-primary" /> Pague com PIX
        </div>
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pix.qrCodeBase64 || "/placeholder.svg"}
            alt="QR Code PIX para pagamento"
            className="h-56 w-56 rounded-lg border border-border bg-white p-2"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Ou copie o código PIX (copia e cola):</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={pix.copyPaste}
              className="min-w-0 flex-1 truncate rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground"
            />
            <Button onClick={handleCopy} variant="outline" size="icon" aria-label="Copiar código PIX">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguardando confirmação do pagamento...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePay}
        disabled={loading}
        className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground glow-pink hover:bg-primary/90"
      >
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        Pagar {amountLabel} com PIX
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Pagamento processado com segurança
      </p>
    </div>
  )
}
