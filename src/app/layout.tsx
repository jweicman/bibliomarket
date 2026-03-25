// src/app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'BiblioMarket – Comprá y vendé libros usados',
    template: '%s | BiblioMarket',
  },
  description:
    'El marketplace de libros usados más grande de Argentina. Comprá y vendé libros entre estudiantes y lectores con envío a todo el país.',
  keywords: ['libros usados', 'comprar libros', 'vender libros', 'marketplace libros', 'Argentina'],
  authors: [{ name: 'BiblioMarket' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.bibliomarket.com.ar',
    siteName: 'BiblioMarket',
    title: 'BiblioMarket – Comprá y vendé libros usados',
    description: 'El marketplace de libros usados más grande de Argentina.',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} ${jetbrains.variable} font-body bg-paper-50 text-ink-800 antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#342818',
                color: '#f9f2e4',
                fontFamily: 'var(--font-instrument)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
              },
              success: { iconTheme: { primary: '#4a9440', secondary: '#f9f2e4' } },
              error: { iconTheme: { primary: '#c74408', secondary: '#f9f2e4' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
