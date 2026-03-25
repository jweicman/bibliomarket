// src/components/home/category-grid.tsx
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  _count: { books: number }
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="container-main py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Explorar por categoría</h2>
        <Link href="/categorias" className="text-sm text-forest-600 hover:underline font-semibold">
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/libros?category=${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-paper-200 hover:border-forest-400 hover:shadow-card transition-all text-center"
          >
            <span className="text-2xl">{cat.icon || '📚'}</span>
            <span className="text-xs font-semibold text-ink-700 group-hover:text-forest-700 leading-tight">
              {cat.name}
            </span>
            <span className="text-xs text-ink-400">{cat._count.books}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
