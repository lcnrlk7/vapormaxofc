import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { hasAdminUser } from "@/lib/data"
import { AdminAuthForm } from "@/components/admin/admin-auth-form"

export const dynamic = "force-dynamic"
export const metadata = { title: "Login | Painel Vapor Max" }

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/admin")
  const adminExists = await hasAdminUser()
  return <AdminAuthForm allowSignup={!adminExists} />
}
