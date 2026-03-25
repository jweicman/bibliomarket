'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, ExternalLink, Star, Check } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  PENDING:            { label: 'Pendiente de pago',  color: 'bg-yellow-100 text-yellow-800', step: 0 },
  PAYMENT_CONFIRMED:  { label: 'Pago confirmado',    color: 'bg-blue-100 text-blue-800',     step: 1 },
  PREPARING:          { label: 'En preparación',     color: 'bg-purple-100 text-purple-800', step: 2 },
  SHIPPED:            { label: 'En camino',           color: 'bg-indigo-100 text-indigo-800', step: 3 },
  DELIVERED:          { label: 'Entregado',           color: 'bg-forest-100 text-forest-800', step: 4 },
  CANCELLED:          { label: 'Cancelado',           color: 'bg-red-100 text-red-800',       step: -1 },
  REFUNDED:           { label: 'Reembolsado',         color: 'bg-gray-100 text-gray-800',     step: -1 },
}

const STEPS = ['Pago', 'Confirmado', 'Preparando', 'En camino', 'Entregado']

export function PurchasesClient({ orders: initialOrders }: { orders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)

  const confirmDelivery = async (orderId: string) => {
    if (!confirm('¿Confirmás que recibiste el libro?')) return
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      })
      if (res.ok) {
        setOrders(orders.map(o =>
          o.id === orderId ? { ...o, status: 'DELIVERED' } : o
        ))
        toast.success('¡Recepción confirmada!')
      }
    } catch {
      toast.error('Error al confirmar')
    }
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">Mis compras</h1>
        <div className="text-center py-20 bg-white rounded-2xl border border-paper-200">
          <ShoppingBag className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-ink-700 mb-2">
            No realizaste ninguna compra
          </h3>
          <p className="text-ink-500 mb-6">Explorá libros y encontrá tu próxima lectura</p>
          <Link href="/libros" className="btn-primary">Explorar libros</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">Mis compras</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
          const trackingUrl = order.ocaGuideNumber
            ? `https://www.oca.com.ar/ocaepak/TrackingWebSite/trackingDTE.asp?numero_guia=${order.ocaGuideNumber}`
            : null
          const canReview = order.status === 'DELIVERED' && !order.review

          return (
            <div key={order.id} className="bg-white rounded-xl border border-paper-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-paper-50 border-b border-paper-200">
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span>Pedido #{order.id.slice(-8).toUpperCase()}</span>
                  <span>·</span>
                  <span>{format(new Date(order.createdAt), "d 'de' MMMM yyyy", { locale: es })}</span>
                </div>
                <span className={`badge text-xs ${status.color}`}>{status.label}</span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex gap-4">
                  <Link href={`/libros/${order.book.id}`} className="shrink-0">
                    <div className="w-16 h-20 bg-paper-100 rounded-lg overflow-hidden">
                      {order.book.images[0] ? (
                        <img
                          src={order.book.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/libros/${order.book.id}`}
                      className="font-display font-bold text-ink-800 hover:text-forest-700 line-clamp-1"
                    >
                      {order.book.title}
                    </Link>
                    <p className="text-sm text-ink-500">{order.book.category?.name}</p>
                    <Link
                      href={`/vendedor/${order.seller.id}`}
                      className="text-xs text-ink-500 hover:text-ink-700 mt-1 block"
                    >
                      Vendedor: <span className="font-semibold">{order.seller.name}</span>
                    </Link>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-ink-600">
                        Libro: <strong>${order.bookPrice.toLocaleString('es-AR')}</strong>
                      </span>
                      {order.shippingCost > 0 && (
                        <span className="text-ink-600">
                          Envío: <strong>${order.shippingCost.toLocaleString('es-AR')}</strong>
                        </span>
                      )}
                      <span className="text-forest-700 font-bold">
                        Total: ${order.total.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {status.step >= 0 && (
                  <div className="mt-4 pt-4 border-t border-paper-100">
                    <div className="flex items-center">
                      {STEPS.map((step, i) => (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              i <= status.step
                                ? 'bg-forest-600 text-white'
                                : 'bg-paper-200 text-ink-400'
                            }`}>
                              {i < status.step ? '✓' : i + 1}
                            </div>
                            <span className="text-xs mt-1 text-ink-500 hidden sm:block whitespace-nowrap">
                              {step}
                            </span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${
                              i < status.step ? 'bg-forest-600' : 'bg-paper-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Rastrear OCA #{order.ocaGuideNumber}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => confirmDelivery(order.id)}
                      className="btn-primary text-xs gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirmar recepción
                    </button>
                  )}

                  {canReview && (
                    <Link
                      href={`/calificar/${order.id}`}
                      className="btn-accent text-xs gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Calificar vendedor
                    </Link>
                  )}

                  {order.review && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                      {'⭐'.repeat(order.review.rating)} Calificación enviada
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
