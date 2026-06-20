"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

const STORAGE_KEY = "vapormax_age_verified"

export function AgeGate() {
  // undefined = ainda não sabemos (evita flash/hydration mismatch)
  const [verified, setVerified] = useState<boolean | undefined>(undefined)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    setVerified(localStorage.getItem(STORAGE_KEY) === "true")
  }, [])

  function confirm() {
    localStorage.setItem(STORAGE_KEY, "true")
    setVerified(true)
  }

  // Não renderiza nada até saber o estado, ou se já verificado
  if (verified === undefined || verified === true) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo-vapormax.png"
            alt="Vapor Max"
            width={88}
            height={88}
            priority
            className="h-20 w-20 drop-shadow-[0_0_20px_rgba(255,45,149,0.5)]"
          />
        </div>

        {denied ? (
          <>
            <div className="mb-3 flex justify-center">
              <ShieldAlert className="h-10 w-10 text-destructive" aria-hidden="true" />
            </div>
            <h2 id="age-gate-title" className="font-heading text-2xl font-extrabold">
              Acesso não permitido
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              Este site é destinado exclusivamente a maiores de 18 anos. Volte quando atingir a idade mínima.
            </p>
            <Button
              variant="outline"
              className="mt-6 w-full border-border bg-transparent"
              onClick={() => setDenied(false)}
            >
              Voltar
            </Button>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="font-heading text-2xl font-extrabold text-balance">
              Você tem mais de 18 anos?
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              O conteúdo da <span className="font-semibold text-foreground">Vapor Max</span> contém produtos com
              nicotina e é destinado apenas a maiores de idade. Confirme para continuar.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                className="w-full bg-primary text-primary-foreground glow-pink hover:bg-primary/90"
                onClick={confirm}
              >
                Sim, tenho 18 anos ou mais
              </Button>
              <Button
                variant="outline"
                className="w-full border-border bg-transparent"
                onClick={() => setDenied(true)}
              >
                Não, sou menor de 18
              </Button>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              O uso de produtos com nicotina é prejudicial à saúde. Venda proibida para menores de 18 anos.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
