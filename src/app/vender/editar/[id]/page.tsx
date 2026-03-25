// src/app/vender/editar/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { EditBookClient } from '@/components/books/edit-book-client'

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: 'asc' } }, category: true },
  })

  if (!book) notFound()
  if (book.sellerId !== session.user.id) redirect('/dashboard')

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">Editar publicación</h1>
        <EditBookClient book={book as any} categories={categories} />
      </main>
      <Footer />
    </>
  )
}
