// src/app/checkout/pending/page.tsx
'use client'
import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">Pago en proceso</h1>
        <p className="text-ink-600 mb-4">
          Tu pago está siendo procesado. Esto puede tardar unas horas (típicamente pagos en efectivo o transferencia).
        </p>
        <p className="text-sm text-ink-500 mb-8">
          Te notificaremos por email cuando el pago sea confirmado y el vendedor pueda preparar el envío.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/compras" className="btn-primary">Ver mis compras</Link>
          <Link href="/libros" className="btn-secondary">Seguir explorando</Link>
        </div>
      </div>
    </div>
  )
}
