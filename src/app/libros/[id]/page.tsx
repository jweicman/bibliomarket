// src/app/libros/[id]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BookDetail } from '@/components/books/book-detail'

interface Props {
  params: { id: string }
}

async function getBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id, status: 'ACTIVE' },
    include: {
      images: { orderBy: { order: 'asc' } },
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          rating: true,
          totalRatings: true,
          city: true,
          province: true,
          createdAt: true,
          _count: { select: { listings: { where: { status: 'ACTIVE' } }, sales: true } },
        },
      },
      category: true,
      _count: { select: { favorites: true } },
    },
  })

  if (!book) return null

  // Increment view count
  await prisma.book.update({
    where: { id },
    data: { views: { increment: 1 } },
  })

  return book
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { images: { take: 1 } },
  })

  if (!book) return { title: 'Libro no encontrado' }

  return {
    title: `${book.title} - ${book.author}`,
    description: book.description || `Comprá "${book.title}" de ${book.author} en BiblioMarket`,
    openGraph: {
      images: book.images[0] ? [{ url: book.images[0].url }] : [],
    },
  }
}

export default async function BookPage({ params }: Props) {
  const book = await getBook(params.id)
  if (!book) notFound()

  // Related books
  const relatedBooks = await prisma.book.findMany({
    where: {
      categoryId: book.categoryId,
      id: { not: book.id },
      status: 'ACTIVE',
    },
    include: {
      images: { take: 1, orderBy: { order: 'asc' } },
      seller: { select: { id: true, name: true, rating: true, city: true, province: true } },
      category: true,
      _count: { select: { favorites: true } },
    },
    take: 6,
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <>
      <Navbar />
      <main>
        <BookDetail book={book as any} relatedBooks={relatedBooks as any} />
      </main>
      <Footer />
    </>
  )
}
