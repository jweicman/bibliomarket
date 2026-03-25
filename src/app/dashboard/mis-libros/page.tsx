// src/app/dashboard/mis-libros/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MyBooksClient } from '@/components/dashboard/my-books-client'

export const metadata = { title: 'Mis libros publicados' }

export default async function MyBooksPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const books = await prisma.book.findMany({
    where: { sellerId: session.user.id },
    include: {
      images: { orderBy: { order: 'asc' }, take: 1 },
      category: true,
      _count: { select: { favorites: true } },
    },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-5xl">
        <MyBooksClient books={books as any} />
      </main>
      <Footer />
    </>
  )
}
