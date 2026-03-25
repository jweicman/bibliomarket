// src/app/calificar/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/navbar'
import { Star, Loader2 } from 'lucide-react'

export default function ReviewPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${params.orderId}`)
      .then(r => r.json())
      .then(d => { setOrder(d.order); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Seleccioná una calificación'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: params.orderId, rating, comment }),
      })
      if (res.ok) {
        toast.success('¡Calificación enviada!')
        router.push('/dashboard/compras')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al enviar la calificación')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const RATING_LABELS = ['', 'Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente']

  return (
    <>
      <Navbar />
      <main className="container-main py-10 max-w-lg">
        <div className="bg-white rounded-2xl border border-paper-200 p-8">
          <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Calificar vendedor</h1>
          <p className="text-ink-500 text-sm mb-6">
            Tu opinión ayuda a otros compradores a conocer al vendedor.
          </p>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-forest-600" /></div>
          ) : order ? (
            <>
              {/* Book info */}
              <div className="flex gap-3 p-3 bg-paper-50 rounded-xl mb-6">
                <div className="w-12 h-16 bg-paper-100 rounded overflow-hidden shrink-0">
                  {order.book?.images?.[0] && (
                    <img src={order.book.images[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink-800 text-sm">{order.book?.title}</p>
                  <p className="text-xs text-ink-500">Vendedor: {order.seller?.name}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star rating */}
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-3">¿Cómo fue tu experiencia?</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hover || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-paper-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {(hover || rating) > 0 && (
                    <p className="text-center text-sm font-semibold text-amber-600 mt-2">
                      {RATING_LABELS[hover || rating]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Contá cómo fue el proceso: el estado del libro, la velocidad del envío, la comunicación del vendedor..."
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-ink-400 text-right mt-1">{comment.length}/1000</p>
                </div>

                <button type="submit" disabled={submitting || rating === 0}
                  className="w-full btn-primary justify-center py-3 text-base rounded-xl">
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : 'Enviar calificación'}
                </button>
              </form>
            </>
          ) : (
            <p className="text-center text-ink-500">Orden no encontrada</p>
          )}
        </div>
      </main>
    </>
  )
}
