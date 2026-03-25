// src/app/checkout/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, MessageCircle, ArrowRight, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((d) => {
          setOrder(d.order)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [orderId])

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {loading ? (
          <Loader2 className="w-10 h-10 animate-spin text-forest-600 mx-auto" />
        ) : (
          <>
            {/* Success icon */}
            <div className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-forest-600" />
            </div>

            <h1 className="font-display text-3xl font-bold text-ink-900 mb-3">
              ¡Compra realizada!
            </h1>

            <p className="text-ink-600 mb-2">
              Tu pago fue procesado exitosamente. El vendedor fue notificado y preparará el envío.
            </p>

            {order && (
              <div className="bg-white rounded-xl border border-paper-200 p-5 my-6 text-left">
                <h3 className="font-semibold text-ink-800 mb-3 text-sm">Resumen del pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-500">Libro</span>
                    <span className="font-medium">{order.book?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Precio</span>
                    <span>${order.bookPrice?.toLocaleString('es-AR')}</span>
                  </div>
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-ink-500">Envío</span>
                      <span>${order.shippingCost?.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-paper-100 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-forest-700">${order.total?.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-forest-50 rounded-lg flex items-center gap-2">
                    <Package className="w-4 h-4 text-forest-600" />
                    <div>
                      <p className="text-xs font-semibold text-forest-800">Número de guía OCA</p>
                      <p className="text-sm font-mono text-forest-700">{order.trackingNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/compras" className="btn-primary">
                <Package className="w-4 h-4" />
                Ver mis compras
              </Link>
              <Link href="/libros" className="btn-secondary">
                Seguir comprando
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-xs text-ink-400 mt-6">
              Recibirás notificaciones por email sobre el estado de tu pedido.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
