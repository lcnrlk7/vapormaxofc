import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Orbitron } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart/cart-provider'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const orbitron = Orbitron({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Vapor Max | Pods, Vapes e Essencias com Entrega Rapida',
  description:
    'Vapor Max - catalogo premium de pods descartaveis, vapes e essencias. Atendimento e entrega rapida em Sao Luis, Sao Jose de Ribamar, Raposa e Paco do Lumiar - MA.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  keywords: ['vape', 'pod', 'descartavel', 'essencia', 'Vapor Max', 'Sao Luis', 'Maranhao'],
  openGraph: {
    title: 'Vapor Max',
    description: 'Catalogo premium de pods, vapes e essencias com entrega rapida.',
    type: 'website',
  },
  verification: {
    other: {
      'facebook-domain-verification': 'wupazskpwuljny3y1uev31ltxydnc1',
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${orbitron.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <CartProvider>{children}</CartProvider>
        <Toaster position="top-center" theme="dark" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
