import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    // Domínios de preview do v0 e da Vercel (wildcards)
    "https://*.vusercontent.net",
    "https://*.v0.dev",
    "https://*.vercel.app",
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  // Privacidade: não rastrear nem armazenar o IP de quem acessa o painel.
  advanced: {
    ipAddress: {
      disableIpTracking: true,
    },
    ...(process.env.NODE_ENV === "development"
      ? {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        }
      : {}),
  },
  // Garante que nem IP nem user agent sejam gravados na sessão.
  databaseHooks: {
    session: {
      create: {
        before: async (sessionData: Record<string, unknown>) => {
          return {
            data: {
              ...sessionData,
              ipAddress: "",
              userAgent: "",
            },
          }
        },
      },
    },
  },
})
