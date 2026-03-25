// src/components/home/recent-books.tsx
import Link from 'next/link'
import { BookCard } from '@/components/books/book-card'

export function RecentBooks({ books }: { books: any[] }) {
  return (
    <section className="container-main py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Últimas publicaciones</h2>
        <Link href="/libros?sort=recent" className="text-sm text-forest-600 hover:underline font-semibold">
          Ver todos →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}
