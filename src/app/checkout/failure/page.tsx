// src/app/checkout/failure/page.tsx
'use client'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">Pago rechazado</h1>
        <p className="text-ink-600 mb-8">
          Hubo un problema con tu pago. Podés intentarlo de nuevo o elegir otro método de pago.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link href={`/checkout/retry/${orderId}`} className="btn-primary">
              Intentar de nuevo
            </Link>
          )}
          <Link href="/libros" className="btn-secondary">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
