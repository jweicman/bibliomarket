import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BooksListing } from '@/components/books/books-listing'
import { prisma } from '@/lib/prisma'
import { Loader2 } from 'lucide-react'

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
    include: {
      _count: { select: { books: { where: { status: 'ACTIVE' } } } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <Navbar />
      <main className="container-main py-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
            </div>
          }
        >
          <BooksListing searchParams={searchParams} categories={categories} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
