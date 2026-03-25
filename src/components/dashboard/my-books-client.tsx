// src/components/dashboard/my-books-client.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Eye, Edit, Pause, Play, Trash2, Heart, MoreVertical } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:  { label: 'Activo', color: 'bg-forest-100 text-forest-800' },
  PAUSED:  { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' },
  SOLD:    { label: 'Vendido', color: 'bg-blue-100 text-blue-800' },
  DELETED: { label: 'Eliminado', color: 'bg-red-100 text-red-800' },
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Nuevo', LIKE_NEW: 'Como nuevo', GOOD: 'Bueno', FAIR: 'Regular', POOR: 'Deteriorado',
}

export function MyBooksClient({ books: initialBooks }: { books: any[] }) {
  const [books, setBooks] = useState(initialBooks)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (bookId: string, status: string) => {
    setLoading(bookId)
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setBooks(books.map(b => b.id === bookId ? { ...b, status } : b))
        toast.success(status === 'ACTIVE' ? 'Publicación activada' : status === 'PAUSED' ? 'Publicación pausada' : 'Libro eliminado')
      }
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setLoading(null)
      setMenuOpen(null)
    }
  }

  const activeBooks = books.filter(b => b.status !== 'DELETED')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Mis libros</h1>
          <p className="text-ink-500 text-sm mt-1">{activeBooks.length} publicaciones</p>
        </div>
        <Link href="/vender" className="btn-primary">
          <Plus className="w-4 h-4" />
          Publicar libro
        </Link>
      </div>

      {activeBooks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-paper-200">
          <p className="text-5xl mb-4">📚</p>
          <h3 className="font-display text-xl font-bold text-ink-700 mb-2">No tenés libros publicados</h3>
          <p className="text-ink-500 mb-6">Publicá tu primer libro gratis y empezá a vender</p>
          <Link href="/vender" className="btn-primary">Publicar mi primer libro</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeBooks.map((book) => {
            const status = STATUS_LABELS[book.status] || STATUS_LABELS.ACTIVE
            return (
              <div key={book.id} className="bg-white rounded-xl border border-paper-200 p-4 flex items-center gap-4">
                {/* Image */}
                <Link href={`/libros/${book.id}`} className="shrink-0">
                  <div className="w-14 h-20 bg-paper-100 rounded-lg overflow-hidden">
                    {book.images[0] ? (
                      <img src={book.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <Link href={`/libros/${book.id}`}
                      className="font-semibold text-ink-800 hover:text-forest-700 truncate">
                      {book.title}
                    </Link>
                    <span className={`badge shrink-0 ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-ink-500 truncate">{book.author}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-500">
                    <span className="badge bg-paper-100 text-ink-600">{CONDITION_LABELS[book.condition]}</span>
                    <span>{book.category.name}</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />{book._count.favorites}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />{book.views || 0} vistas
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-display font-bold text-forest-700">
                    ${book.price.toLocaleString('es-AR')}
                  </p>
                  {book.originalPrice && (
                    <p className="text-xs text-ink-400 line-through">
                      ${book.originalPrice.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>

                {/* Actions menu */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setMenuOpen(menuOpen === book.id ? null : book.id)}
                    className="btn-ghost p-2 rounded-lg"
                    disabled={loading === book.id}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpen === book.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-paper-200 py-1 z-20">
                        <Link href={`/libros/${book.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-paper-50">
                          <Eye className="w-4 h-4" /> Ver publicación
                        </Link>
                        <Link href={`/vender/editar/${book.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-paper-50">
                          <Edit className="w-4 h-4" /> Editar
                        </Link>
                        {book.status === 'ACTIVE' ? (
                          <button onClick={() => updateStatus(book.id, 'PAUSED')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-paper-50 w-full text-left">
                            <Pause className="w-4 h-4" /> Pausar publicación
                          </button>
                        ) : book.status === 'PAUSED' ? (
                          <button onClick={() => updateStatus(book.id, 'ACTIVE')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-paper-50 w-full text-left">
                            <Play className="w-4 h-4" /> Reactivar
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminás esta publicación? No se puede deshacer.')) {
                              updateStatus(book.id, 'DELETED')
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
