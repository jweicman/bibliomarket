// src/app/libros/page.tsx
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BooksListing } from '@/components/books/books-listing'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Explorar libros',
  description: 'Encontrá miles de libros usados a los mejores precios en Argentina.',
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { books: { where: { status: 'ACTIVE' } } } } },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <Navbar />
      <main className="container-main py-8">
        <Suspense fallback={<div className="h-96 animate-pulse bg-paper-100 rounded-xl" />}>
          <BooksListing searchParams={searchParams} categories={categories} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
