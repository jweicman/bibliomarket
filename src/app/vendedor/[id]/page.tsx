// src/app/vendedor/[id]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookCard } from '@/components/books/book-card'
import { Star, MapPin, Calendar, Package, ShoppingBag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { name: true } })
  if (!user) return { title: 'Vendedor no encontrado' }
  return { title: `${user.name} - Perfil de vendedor` }
}

export default async function SellerProfilePage({ params }: Props) {
  const seller = await prisma.user.findUnique({
    where: { id: params.id, isBanned: false },
    select: {
      id: true, name: true, avatar: true, rating: true, totalRatings: true,
      city: true, province: true, createdAt: true,
      _count: { select: { listings: { where: { status: { in: ['ACTIVE', 'SOLD'] } } }, sales: { where: { status: 'DELIVERED' } } } },
    },
  })

  if (!seller) notFound()

  const [books, reviews] = await Promise.all([
    prisma.book.findMany({
      where: { sellerId: params.id, status: 'ACTIVE' },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        seller: { select: { id: true, name: true, rating: true, city: true, province: true } },
        category: true,
        _count: { select: { favorites: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    }),
    prisma.review.findMany({
      where: { reviewedId: params.id },
      include: { reviewer: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }))

  return (
    <>
      <Navbar />
      <main className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seller sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-paper-200 p-6 sticky top-20">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-display font-bold text-3xl overflow-hidden mb-3">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (seller.name?.[0] || 'V').toUpperCase()
                  )}
                </div>
                <h1 className="font-display text-xl font-bold text-ink-900">{seller.name}</h1>
                {(seller.city || seller.province) && (
                  <p className="text-sm text-ink-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {seller.city || seller.province}
                  </p>
                )}
              </div>

              {/* Rating summary */}
              {seller.rating > 0 && (
                <div className="text-center mb-5 p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    <span className="text-3xl font-display font-bold text-ink-900">{seller.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-ink-500">{seller.totalRatings} calificaciones</p>

                  {/* Rating bars */}
                  <div className="mt-3 space-y-1">
                    {ratingCounts.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-4 text-right text-ink-500">{star}</span>
                        <div className="flex-1 bg-paper-200 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-4 text-ink-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-ink-600">
                  <Package className="w-4 h-4 text-ink-400" />
                  <span>{seller._count.listings} publicaciones</span>
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <ShoppingBag className="w-4 h-4 text-ink-400" />
                  <span>{seller._count.sales} ventas completadas</span>
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <Calendar className="w-4 h-4 text-ink-400" />
                  <span>Miembro desde {format(seller.createdAt, 'MMMM yyyy', { locale: es })}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Books */}
            <section>
              <h2 className="font-display text-xl font-bold text-ink-800 mb-4">
                Libros disponibles ({books.length})
              </h2>
              {books.length === 0 ? (
                <p className="text-ink-500 text-sm">Este vendedor no tiene publicaciones activas.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {books.map((book) => <BookCard key={book.id} book={book as any} />)}
                </div>
              )}
            </section>

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-ink-800 mb-4">
                  Calificaciones ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-paper-200 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-sm overflow-hidden shrink-0">
                          {review.reviewer.avatar ? (
                            <img src={review.reviewer.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (review.reviewer.name?.[0] || 'U').toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-800">{review.reviewer.name}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-paper-300'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-ink-400">
                          {format(review.createdAt, "d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-ink-600 leading-relaxed pl-12">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
