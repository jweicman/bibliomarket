// src/app/dashboard/favoritos/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookCard } from '@/components/books/book-card'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export const metadata = { title: 'Mis favoritos' }

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      book: {
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          seller: { select: { id: true, name: true, rating: true, city: true, province: true } },
          category: true,
          _count: { select: { favorites: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const activeBooks = favorites.filter(f => f.book.status === 'ACTIVE')

  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-6xl">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">
          Mis favoritos <span className="text-ink-400 text-xl">({activeBooks.length})</span>
        </h1>

        {activeBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-paper-200">
            <Heart className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-ink-700 mb-2">No tenés favoritos guardados</h3>
            <p className="text-ink-500 mb-6">Guardá libros tocando el corazón en cada publicación</p>
            <Link href="/libros" className="btn-primary">Explorar libros</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {activeBooks.map((fav) => (
              <BookCard key={fav.bookId} book={fav.book as any} isFavorited={true} />
            ))}
          </div>
        )}

        {favorites.length > activeBooks.length && (
          <p className="text-sm text-ink-400 mt-4 text-center">
            {favorites.length - activeBooks.length} libro(s) guardado(s) ya no están disponibles.
          </p>
        )}
      </main>
      <Footer />
    </>
  )
}
