// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import {
  BookOpen, Package, ShoppingBag, Heart, Star,
  TrendingUp, Plus, Bell, ArrowRight, Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_CONFIRMED: { label: 'Pago confirmado', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'En preparación', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Entregado', color: 'bg-forest-100 text-forest-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const [user, recentPurchases, recentSales, activeListings, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true, email: true, avatar: true, rating: true,
        totalRatings: true, city: true, province: true, createdAt: true,
        _count: { select: { listings: { where: { status: 'ACTIVE' } }, purchases: true, sales: { where: { status: 'DELIVERED' } } } },
      },
    }),
    prisma.order.findMany({
      where: { buyerId: session.user.id },
      include: { book: { include: { images: { take: 1, orderBy: { order: 'asc' } } } }, seller: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.order.findMany({
      where: { sellerId: session.user.id },
      include: { book: { include: { images: { take: 1, orderBy: { order: 'asc' } } } }, buyer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.book.findMany({
      where: { sellerId: session.user.id, status: 'ACTIVE' },
      include: { images: { take: 1, orderBy: { order: 'asc' } }, _count: { select: { favorites: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id, read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  if (!user) redirect('/auth/login')

  const stats = [
    { icon: BookOpen, label: 'Publicaciones activas', value: user._count.listings, href: '/dashboard/mis-libros', color: 'bg-forest-100 text-forest-700' },
    { icon: ShoppingBag, label: 'Compras realizadas', value: user._count.purchases, href: '/dashboard/compras', color: 'bg-blue-100 text-blue-700' },
    { icon: Package, label: 'Ventas completadas', value: user._count.sales, href: '/dashboard/ventas', color: 'bg-purple-100 text-purple-700' },
    { icon: Star, label: 'Calificación', value: user.rating > 0 ? user.rating.toFixed(1) : '–', href: '/dashboard/perfil', color: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-6xl">
        {/* Welcome header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">
              Hola, {user.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-ink-500 mt-1">
              Miembro desde {formatDistanceToNow(user.createdAt, { addSuffix: true, locale: es })}
              {user.city && ` · ${user.city}`}
            </p>
          </div>
          <Link href="/vender" className="btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            Publicar libro
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, href, color }) => (
            <Link key={href} href={href} className="bg-white rounded-xl border border-paper-200 p-4 hover:shadow-card transition-shadow group">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-ink-900">{value}</p>
              <p className="text-xs text-ink-500 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="lg:col-span-1 bg-white rounded-xl border border-paper-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-ink-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent-500" />
                  Notificaciones
                  <span className="badge bg-accent-500 text-white">{notifications.length}</span>
                </h2>
                <Link href="/dashboard/notificaciones" className="text-xs text-forest-600 hover:underline">Ver todas</Link>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 p-3 bg-paper-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-forest-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{n.title}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{n.body}</p>
                      <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent purchases */}
          <div className={`bg-white rounded-xl border border-paper-200 p-5 ${notifications.length === 0 ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink-800">Últimas compras</h2>
              <Link href="/dashboard/compras" className="text-xs text-forest-600 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentPurchases.length === 0 ? (
              <div className="text-center py-8 text-ink-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Todavía no realizaste ninguna compra</p>
                <Link href="/libros" className="text-xs text-forest-600 hover:underline mt-1 block">
                  Explorar libros
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((order) => {
                  const status = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-paper-100 text-ink-600' }
                  return (
                    <Link key={order.id} href={`/dashboard/compras/${order.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-paper-50 transition-colors">
                      <div className="w-12 h-12 bg-paper-100 rounded-lg overflow-hidden shrink-0">
                        {order.book.images[0] && (
                          <img src={order.book.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{order.book.title}</p>
                        <p className="text-xs text-ink-500">Vendedor: {order.seller.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-forest-700">${order.total.toLocaleString('es-AR')}</p>
                        <span className={`badge text-xs ${status.color}`}>{status.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active listings */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-paper-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink-800">Mis publicaciones</h2>
              <Link href="/dashboard/mis-libros" className="text-xs text-forest-600 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {activeListings.length === 0 ? (
              <div className="text-center py-8 text-ink-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tenés libros publicados</p>
                <Link href="/vender" className="text-xs text-forest-600 hover:underline mt-1 block">
                  Publicar mi primer libro
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeListings.map((book) => (
                  <Link key={book.id} href={`/libros/${book.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-paper-50 transition-colors">
                    <div className="w-10 h-14 bg-paper-100 rounded overflow-hidden shrink-0">
                      {book.images[0] && (
                        <img src={book.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-800 truncate">{book.title}</p>
                      <p className="text-xs text-ink-500">{book._count.favorites} favoritos</p>
                    </div>
                    <p className="text-sm font-bold text-forest-700 shrink-0">
                      ${book.price.toLocaleString('es-AR')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent sales */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-paper-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink-800">Últimas ventas</h2>
              <Link href="/dashboard/ventas" className="text-xs text-forest-600 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-ink-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Todavía no realizaste ninguna venta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((order) => {
                  const status = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-paper-100 text-ink-600' }
                  const earned = order.total - order.platformFee
                  return (
                    <Link key={order.id} href={`/dashboard/ventas/${order.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-paper-50 transition-colors">
                      <div className="w-12 h-12 bg-paper-100 rounded-lg overflow-hidden shrink-0">
                        {order.book.images[0] && (
                          <img src={order.book.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 truncate">{order.book.title}</p>
                        <p className="text-xs text-ink-500">Comprador: {order.buyer.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-forest-700">${earned.toLocaleString('es-AR')}</p>
                        <span className={`badge text-xs ${status.color}`}>{status.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
