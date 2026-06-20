"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getBalance, isGatewayConfigured } from "@/lib/promissepay"
import { isDuttyfyConfigured } from "@/lib/duttyfy"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Não autorizado")
}

export type GatewayStatus = {
  id: string
  name: string
  description: string
  configured: boolean
  connected: boolean
  balanceAvailable: number | null
  hasBalance: boolean
  envVar: string
}

export async function checkGatewayStatus(): Promise<GatewayStatus[]> {
  await requireAdmin()

  // PromissePay
  const promiseConfigured = isGatewayConfigured()
  const promiseBalance = promiseConfigured ? await getBalance() : null
  const promise: GatewayStatus = {
    id: "promisepay",
    name: "PromissePay",
    description: "Cobranças via PIX (QR Code e copia e cola).",
    configured: promiseConfigured,
    connected: promiseConfigured ? promiseBalance !== null : false,
    balanceAvailable: promiseBalance ? promiseBalance.balance_available : null,
    hasBalance: true,
    envVar: "PROMISEPAY_API_KEY",
  }

  // Duttyfy (sem endpoint de saldo; consideramos conectada se configurada)
  const duttyfyConfigured = isDuttyfyConfigured()
  const duttyfy: GatewayStatus = {
    id: "duttyfy",
    name: "Duttyfy",
    description: "Cobranças via PIX (QR Code e copia e cola).",
    configured: duttyfyConfigured,
    connected: duttyfyConfigured,
    balanceAvailable: null,
    hasBalance: false,
    envVar: "DUTTYFY_PIX_URL_ENCRYPTED",
  }

  return [promise, duttyfy]
}
