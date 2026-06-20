"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getBalance, isGatewayConfigured } from "@/lib/promissepay"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Não autorizado")
}

export type GatewayStatus = {
  configured: boolean
  connected: boolean
  balanceAvailable: number | null
}

export async function checkGatewayStatus(): Promise<GatewayStatus> {
  await requireAdmin()
  const configured = isGatewayConfigured()
  if (!configured) return { configured: false, connected: false, balanceAvailable: null }
  const balance = await getBalance()
  return {
    configured: true,
    connected: balance !== null,
    balanceAvailable: balance ? balance.balance_available : null,
  }
}
