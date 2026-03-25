// src/components/dashboard/sales-client.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Package, Truck, TrendingUp, DollarSign, ExternalLink, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:            { label: 'Esperando pago', color: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_CONFIRMED:  { label: '💰 ¡Pago recibido! Preparar envío', color: 'bg-blue-100 text-blue-800' },
  PREPARING:          { label: 'En preparación', color: 'bg-purple-100 text-purple-800' },
  SHIPPED:            { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED:          { label: 'Entregado', color: 'bg-forest-100 text-forest-800' },
  CANCELLED:          { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}

export function SalesClient({ orders: initialOrders, totalEarned }: { orders: any[]; totalEarned: number }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})

  const updateOrder = async (orderId: string, data: any) => {
    setLoading(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const { order } = await res.json()
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...order } : o))
        toast.success('Estado actualizado')
      } else {
        toast.error('Error al actualizar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(null)
    }
  }

  const pendingOrders = orders.filter(o => ['PAYMENT_CONFIRMED', 'PREPARING'].includes(o.status))
  const activeOrders = orders.filter(o => o.status === 'SHIPPED')
  const completedOrders = orders.filter(o => ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status))

  const renderOrderCard = (order: any) => {
    const status = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-paper-100 text-ink-600' }
    const earned = order.total - order.platformFee
    const shippingAddress = order.shippingAddress as any

    return (
      <div key={order.id} className={`bg-white rounded-xl border overflow-hidden ${
        order.status === 'PAYMENT_CONFIRMED' ? 'border-blue-400 shadow-md' : 'border-paper-200'
      }`}>
        <div className="flex items-center justify-between px-5 py-3 bg-paper-50 border-b border-paper-200">
          <div className="text-xs text-ink-500 flex items-center gap-3">
            <span>#{order.id.slice(-8).toUpperCase()}</span>
            <span>·</span>
            <span>{format(order.createdAt, "d MMM yyyy", { locale: es })}</span>
          </div>
          <span className={`badge text-xs ${status.color}`}>{status.label}</span>
        </div>

        <div className="p-5">
          <div className="flex gap-4 mb-4">
            <div className="w-14 h-20 bg-paper-100 rounded-lg overflow-hidden shrink-0">
              {order.book.images[0] ? (
                <img src={order.book.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-800 truncate">{order.book.title}</p>

              {/* Buyer info */}
              <div className="mt-1 text-sm text-ink-600">
                <span className="font-medium">{order.buyer.name}</span>
                {order.buyer.phone && <span className="text-ink-400 ml-2">{order.buyer.phone}</span>}
              </div>

              {/* Shipping address */}
              {shippingAddress && (
                <div className="mt-1 text-xs text-ink-500 bg-paper-50 rounded-lg px-3 py-2">
                  📦 {shippingAddress.street} {shippingAddress.streetNumber}
                  {shippingAddress.apartment && `, ${shippingAddress.apartment}`},{' '}
                  {shippingAddress.city}, {shippingAddress.province} ({shippingAddress.postalCode})
                </div>
              )}

              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-ink-500">Total: <strong className="text-ink-800">${order.total.toLocaleString('es-AR')}</strong></span>
                <span className="text-forest-700 font-bold">Ganás: ${earned.toLocaleString('es-AR')}</span>
                <span className="text-xs text-ink-400">(comisión 8%: ${order.platformFee.toLocaleString('es-AR')})</span>
              </div>
            </div>
          </div>

          {/* Actions based on status */}
          {order.status === 'PAYMENT_CONFIRMED' && (
            <div className="border-t border-paper-100 pt-4">
              <p className="text-sm font-semibold text-blue-800 mb-3">
                ✅ El pago fue acreditado. Por favor preparar el envío.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateOrder(order.id, { status: 'PREPARING' })}
                  disabled={loading === order.id}
                  className="btn-secondary text-sm"
                >
                  {loading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  Marcar en preparación
                </button>
              </div>
            </div>
          )}

          {order.status === 'PREPARING' && (
            <div className="border-t border-paper-100 pt-4">
              <p className="text-sm font-semibold text-ink-700 mb-3">Ingresá el número de guía OCA:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInputs[order.id] || ''}
                  onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                  placeholder="Ej: 40023456789"
                  className="input-field text-sm py-2 flex-1"
                />
                <button
                  onClick={() => {
                    const tracking = trackingInputs[order.id]
                    if (!tracking) { toast.error('Ingresá el número de guía'); return }
                    updateOrder(order.id, { status: 'SHIPPED', trackingNumber: tracking })
                  }}
                  disabled={loading === order.id}
                  className="btn-primary text-sm"
                >
                  {loading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  Marcar como enviado
                </button>
              </div>
            </div>
          )}

          {order.status === 'SHIPPED' && order.trackingNumber && (
            <div className="border-t border-paper-100 pt-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-indigo-700">Guía OCA: <strong>{order.trackingNumber}</strong></span>
              <a href={`https://www.oca.com.ar/ocaepak/TrackingWebSite/trackingDTE.asp?numero_guia=${order.trackingNumber}`}
                target="_blank" rel="noopener"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                Rastrear <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {order.review && (
            <div className="border-t border-paper-100 pt-3 flex items-center gap-2">
              <span className="text-sm text-amber-600">{'⭐'.repeat(order.review.rating)}</span>
              {order.review.comment && <span className="text-sm text-ink-600 italic">"{order.review.comment}"</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with earnings summary */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Mis ventas</h1>
          <p className="text-ink-500 text-sm mt-1">{orders.length} ventas en total</p>
        </div>
        <div className="bg-white rounded-xl border border-paper-200 px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <p className="text-xs text-ink-500">Total ganado</p>
            <p className="text-xl font-display font-bold text-forest-700">
              ${totalEarned.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-paper-200">
          <TrendingUp className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-ink-700 mb-2">Todavía no realizaste ventas</h3>
          <p className="text-ink-500 mb-6">Publicá libros y empezá a generar ingresos</p>
          <Link href="/vender" className="btn-primary">Publicar un libro</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingOrders.length > 0 && (
            <section>
              <h2 className="font-semibold text-ink-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Requieren acción ({pendingOrders.length})
              </h2>
              <div className="space-y-3">{pendingOrders.map(renderOrderCard)}</div>
            </section>
          )}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="font-semibold text-ink-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                En camino ({activeOrders.length})
              </h2>
              <div className="space-y-3">{activeOrders.map(renderOrderCard)}</div>
            </section>
          )}
          {completedOrders.length > 0 && (
            <section>
              <h2 className="font-semibold text-ink-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest-500" />
                Completadas ({completedOrders.length})
              </h2>
              <div className="space-y-3">{completedOrders.map(renderOrderCard)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
