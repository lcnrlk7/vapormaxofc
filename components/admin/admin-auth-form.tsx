"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function AdminAuthForm({ allowSignup }: { allowSignup: boolean }) {
  const router = useRouter()
  const [mode, setMode] = useState<"sign-in" | "sign-up">(allowSignup ? "sign-up" : "sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? "Não foi possível continuar.")
      return
    }
    router.push("/admin")
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 neon-grid">
      <Card className="w-full max-w-sm border-border bg-card p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo-square.png" alt="Vapor Max" width={72} height={72} className="h-16 w-16" />
          <h1 className="mt-4 font-heading text-xl font-bold">Painel Vapor Max</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp ? "Crie a conta de administrador" : "Acesse o painel administrativo"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        {allowSignup && (
          <button
            type="button"
            onClick={() => {
              setMode(isSignUp ? "sign-in" : "sign-up")
              setError(null)
            }}
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {isSignUp ? "Já tenho conta - Entrar" : "Criar conta de administrador"}
          </button>
        )}
      </Card>
    </main>
  )
}
