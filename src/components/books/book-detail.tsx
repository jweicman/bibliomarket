// src/components/books/book-detail.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
  Heart, Share2, MapPin, Star, Package, Truck,
  MessageCircle, ShieldCheck, ChevronLeft, ChevronRight,
  Eye, BookOpen, User, Calendar, AlertTriangle
} from 'lucide-react'
import { BookCard } from './book-card'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Nuevo',
  LIKE_NEW: 'Como nuevo',
  GOOD: 'Bueno',
  FAIR: 'Regular',
  POOR: 'Deteriorado',
}

const SHIPPING_LABELS: Record<string, string> = {
  OCA_E_PAK: 'OCA e-Pak (Puerta a Puerta)',
  OCA_SUCURSAL: 'OCA a Sucursal',
  CORREO_ARGENTINO: 'Correo Argentino',
  PERSONAL_DELIVERY: 'Entrega personal',
  MEET_IN_PERSON: 'Encuentro en persona',
}

export function BookDetail({ book, relatedBooks }: { book: any; relatedBooks: any[] }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeImage, setActiveImage] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [buying, setBuying] = useState(false)

  const isOwner = session?.user?.id === book.seller.id

  const handleBuy = async () => {
    if (!session) {
      toast.error('Iniciá sesión para comprar')
      router.push('/auth/login?redirect=' + encodeURIComponent(`/libros/${book.id}`))
      return
    }

    if (isOwner) {
      toast.error('No podés comprar tu propio libro')
      return
    }

    setBuying(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      })

      if (!res.ok) throw new Error()

      const { order, preferenceUrl } = await res.json()
      // Redirect to MercadoPago
      window.location.href = preferenceUrl
    } catch {
      toast.error('Error al procesar la compra. Intentá de nuevo.')
      setBuying(false)
    }
  }

  const handleContact = async () => {
    if (!session) {
      toast.error('Iniciá sesión para contactar al vendedor')
      return
    }
    router.push(`/mensajes?seller=${book.seller.id}&book=${book.id}`)
  }

  const toggleFavorite = async () => {
    if (!session) {
      toast.error('Iniciá sesión para guardar favoritos')
      return
    }
    const res = await fetch(`/api/books/${book.id}/favorite`, {
      method: favorited ? 'DELETE' : 'POST',
    })
    if (res.ok) setFavorited(!favorited)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Mirá "${book.title}" de ${book.author} en BiblioMarket`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado')
    }
  }

  const platformFee = book.price * 0.08
  const totalWithShipping = book.price + (book.shippingCost || 0)

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-500 mb-6">
        <Link href="/" className="hover:text-ink-800">Inicio</Link>
        <span>/</span>
        <Link href="/libros" className="hover:text-ink-800">Libros</Link>
        <span>/</span>
        <Link href={`/categorias/${book.category.slug}`} className="hover:text-ink-800">{book.category.name}</Link>
        <span>/</span>
        <span className="text-ink-700 truncate max-w-40">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main image */}
          <div className="relative bg-paper-100 rounded-2xl overflow-hidden aspect-[4/3]">
            {book.images.length > 0 ? (
              <img
                src={book.images[activeImage]?.url}
                alt={book.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-300">
                <div className="text-center">
                  <div className="text-8xl mb-4">📚</div>
                  <p>Sin fotos</p>
                </div>
              </div>
            )}

            {/* Image navigation */}
            {book.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(Math.max(0, activeImage - 1))}
                  disabled={activeImage === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImage(Math.min(book.images.length - 1, activeImage + 1))}
                  disabled={activeImage === book.images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Actions overlay */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={toggleFavorite}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                  favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-ink-600 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md text-ink-600 hover:text-ink-900"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-ink-600 bg-white/90 rounded-full px-3 py-1">
              <Eye className="w-3 h-3" />
              {book.views} vistas
            </div>
          </div>

          {/* Thumbnails */}
          {book.images.length > 1 && (
            <div className="flex gap-2">
              {book.images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-forest-500' : 'border-paper-200 hover:border-paper-400'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Book info */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {book.category.name}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-paper-400" />
                  <span className={`badge ${
                    { NEW: 'badge-nuevo', LIKE_NEW: 'badge-como-nuevo', GOOD: 'badge-bueno', FAIR: 'badge-regular', POOR: 'badge-malo' }[book.condition as string] || 'badge-bueno'
                  }`}>
                    {CONDITION_LABELS[book.condition]}
                  </span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-900 mb-1">
                  {book.title}
                </h1>
                <p className="text-ink-600 text-lg">{book.author}</p>
                {book.isbn && (
                  <p className="text-sm text-ink-400 mt-1 font-mono">ISBN: {book.isbn}</p>
                )}
              </div>
            </div>

            {book.description && (
              <div className="border-t border-paper-100 pt-4">
                <h3 className="font-semibold text-ink-700 mb-2 text-sm">Descripción del vendedor</h3>
                <p className="text-ink-600 text-sm leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}

            {/* Shipping options */}
            <div className="border-t border-paper-100 pt-4 mt-4">
              <h3 className="font-semibold text-ink-700 mb-3 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Opciones de entrega
              </h3>
              <div className="space-y-2">
                {book.shippingModes.map((mode: string) => (
                  <div key={mode} className="flex items-center gap-2 text-sm text-ink-600">
                    <div className="w-2 h-2 rounded-full bg-forest-500" />
                    {SHIPPING_LABELS[mode] || mode}
                  </div>
                ))}
              </div>
            </div>

            {/* Published date */}
            <div className="border-t border-paper-100 pt-4 mt-4 flex items-center gap-2 text-xs text-ink-500">
              <Calendar className="w-3.5 h-3.5" />
              Publicado {formatDistanceToNow(new Date(book.publishedAt), { addSuffix: true, locale: es })}
            </div>
          </div>

          {/* Seller info */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <h3 className="font-semibold text-ink-700 mb-4 text-sm">Vendedor</h3>
            <div className="flex items-start gap-4">
              <Link href={`/vendedor/${book.seller.id}`} className="shrink-0">
                <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-display font-bold text-xl overflow-hidden">
                  {book.seller.avatar ? (
                    <img src={book.seller.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (book.seller.name?.[0] || 'V').toUpperCase()
                  )}
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/vendedor/${book.seller.id}`} className="font-semibold text-ink-800 hover:text-forest-700">
                  {book.seller.name}
                </Link>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">
                    {book.seller.rating > 0 ? book.seller.rating.toFixed(1) : 'Sin calificaciones'}
                  </span>
                  {book.seller.totalRatings > 0 && (
                    <span className="text-xs text-ink-500">({book.seller.totalRatings} ventas)</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-ink-500">
                  <span>{book.seller._count.listings} publicaciones activas</span>
                  {(book.seller.city || book.seller.province) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {book.seller.city || book.seller.province}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleContact}
              className="w-full mt-4 btn-secondary justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar vendedor
            </button>
          </div>
        </div>

        {/* Right: Purchase panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-paper-200 p-6 shadow-card">
              {/* Price */}
              <div className="mb-4">
                {book.originalPrice && book.originalPrice > book.price && (
                  <p className="text-sm text-ink-400 line-through">
                    ${book.originalPrice.toLocaleString('es-AR')}
                  </p>
                )}
                <p className="text-4xl font-display font-bold text-forest-700">
                  ${book.price.toLocaleString('es-AR')}
                </p>
                {book.originalPrice && book.originalPrice > book.price && (
                  <p className="text-sm text-forest-600 font-semibold mt-0.5">
                    {Math.round((1 - book.price / book.originalPrice) * 100)}% de descuento
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              {book.shippingCost && (
                <div className="border-t border-paper-100 py-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-600">Precio del libro</span>
                    <span>${book.price.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-600">Envío estimado</span>
                    <span>${book.shippingCost.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-paper-100 pt-1.5">
                    <span>Total estimado</span>
                    <span className="text-forest-700">${totalWithShipping.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

              {/* Buy button */}
              {!isOwner ? (
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full btn-primary justify-center py-3.5 text-base rounded-xl mt-4"
                >
                  {buying ? 'Procesando...' : 'Comprar ahora'}
                </button>
              ) : (
                <div className="mt-4 space-y-2">
                  <Link href={`/vender/editar/${book.id}`} className="w-full btn-secondary justify-center">
                    Editar publicación
                  </Link>
                </div>
              )}

              {/* Trust signals */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
                  <span>Pago seguro con MercadoPago</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <Package className="w-4 h-4 text-forest-600 shrink-0" />
                  <span>Envío por OCA a todo el país</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Si hay un problema, te ayudamos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ink-800 mb-6">
            Más libros en {book.category.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
