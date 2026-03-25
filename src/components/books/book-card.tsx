// src/components/books/book-card.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, MapPin, Star, Truck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface BookCardProps {
  book: {
    id: string
    title: string
    author: string
    price: number
    originalPrice?: number | null
    condition: string
    city?: string | null
    province?: string | null
    images: { url: string }[]
    seller: {
      id: string
      name: string | null
      rating: number
    }
    category: { name: string }
    _count: { favorites: number }
    shippingModes: string[]
    publishedAt: Date | string
  }
  isFavorited?: boolean
}

const CONDITION_LABELS: Record<string, { label: string; className: string }> = {
  NEW: { label: 'Nuevo', className: 'badge-nuevo' },
  LIKE_NEW: { label: 'Como nuevo', className: 'badge-como-nuevo' },
  GOOD: { label: 'Bueno', className: 'badge-bueno' },
  FAIR: { label: 'Regular', className: 'badge-regular' },
  POOR: { label: 'Deteriorado', className: 'badge-malo' },
}

export function BookCard({ book, isFavorited: initialFav = false }: BookCardProps) {
  const { data: session } = useSession()
  const [favorited, setFavorited] = useState(initialFav)
  const [loading, setLoading] = useState(false)

  const condition = CONDITION_LABELS[book.condition] || { label: book.condition, className: 'badge-bueno' }
  const hasShipping = book.shippingModes.some((m) => ['OCA_E_PAK', 'OCA_SUCURSAL', 'CORREO_ARGENTINO'].includes(m))
  const discount = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : null

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Iniciá sesión para guardar favoritos')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/books/${book.id}/favorite`, {
        method: favorited ? 'DELETE' : 'POST',
      })
      if (res.ok) {
        setFavorited(!favorited)
        toast.success(favorited ? 'Eliminado de favoritos' : 'Guardado en favoritos')
      }
    } catch {
      toast.error('Error al actualizar favorito')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/libros/${book.id}`} className="group block">
      <article className="book-card bg-white rounded-xl overflow-hidden border border-paper-200 shadow-card">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-paper-100 overflow-hidden">
          {book.images[0] ? (
            <img
              src={book.images[0].url}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-ink-300">
                <div className="text-5xl mb-2">📚</div>
                <p className="text-xs">Sin foto</p>
              </div>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className={condition.className}>{condition.label}</span>
            {discount && discount > 0 && (
              <span className="badge bg-accent-500 text-white">-{discount}%</span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              favorited
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/90 text-ink-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Shipping badge */}
          {hasShipping && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest-600/90 text-paper-50 rounded-full text-xs font-semibold">
                <Truck className="w-3 h-3" />
                Envío
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-ink-500 mb-0.5 font-semibold uppercase tracking-wide">
            {book.category.name}
          </p>
          <h3 className="font-display font-bold text-ink-800 text-sm leading-tight line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-xs text-ink-500 line-clamp-1 mb-2">{book.author}</p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-display font-bold text-forest-700">
              ${book.price.toLocaleString('es-AR')}
            </span>
            {book.originalPrice && (
              <span className="text-xs text-ink-400 line-through">
                ${book.originalPrice.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Seller info */}
          <div className="flex items-center justify-between text-xs text-ink-500 pt-2 border-t border-paper-100">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{book.seller.rating > 0 ? book.seller.rating.toFixed(1) : 'Nuevo'}</span>
            </div>
            {(book.city || book.province) && (
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-24">{book.city || book.province}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
