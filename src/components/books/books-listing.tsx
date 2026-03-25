// src/components/books/books-listing.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookCard } from './book-card'
import {
  Search, SlidersHorizontal, X, ChevronDown, Loader2,
  LayoutGrid, List, ArrowUpDown
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: { books: number }
}

interface BooksListingProps {
  searchParams: { [key: string]: string | undefined }
  categories: Category[]
}

const CONDITIONS = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'LIKE_NEW', label: 'Como nuevo' },
  { value: 'GOOD', label: 'Bueno' },
  { value: 'FAIR', label: 'Regular' },
  { value: 'POOR', label: 'Deteriorado' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'popular', label: 'Más vistos' },
]

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza',
  'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Chaco',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro',
  'Neuquén', 'Formosa', 'Chubut', 'San Luis', 'Catamarca',
  'La Rioja', 'La Pampa', 'Santa Cruz', 'Corrientes', 'Tierra del Fuego',
]

export function BooksListing({ searchParams: initialParams, categories }: BooksListingProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [books, setBooks] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || '')
  const [province, setProvince] = useState(searchParams.get('province') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent')
  const [onlyShipping, setOnlyShipping] = useState(searchParams.get('shipping') === 'true')
  const [page, setPage] = useState(1)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (category) params.set('category', category)
      if (condition) params.set('condition', condition)
      if (province) params.set('province', province)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (sort) params.set('sort', sort)
      if (onlyShipping) params.set('shipping', 'true')
      params.set('page', String(page))
      params.set('limit', '24')

      const res = await fetch(`/api/books?${params}`)
      const data = await res.json()
      setBooks(data.books || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [query, category, condition, province, minPrice, maxPrice, sort, onlyShipping, page])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchBooks()
  }

  const clearFilters = () => {
    setCategory('')
    setCondition('')
    setProvince('')
    setMinPrice('')
    setMaxPrice('')
    setOnlyShipping(false)
    setPage(1)
  }

  const activeFilterCount = [category, condition, province, minPrice, maxPrice, onlyShipping].filter(Boolean).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">
            {query ? `Resultados para "${query}"` : 'Explorar libros'}
          </h1>
          {!loading && (
            <p className="text-ink-500 text-sm mt-1">
              {total.toLocaleString('es-AR')} libro{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1) }}
              className="input-field pr-8 appearance-none text-sm py-2 pl-3"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`btn-secondary gap-2 text-sm relative ${filtersOpen ? 'border-forest-500 bg-forest-50' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-forest-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor o ISBN..."
            className="input-field pl-10"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setPage(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary">Buscar</button>
      </form>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="bg-white border border-paper-200 rounded-xl p-5 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-800">Filtros</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5 uppercase tracking-wide">Categoría</label>
              <div className="relative">
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                  className="input-field pr-8 appearance-none text-sm">
                  <option value="">Todas las categorías</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name} ({c._count.books})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5 uppercase tracking-wide">Estado</label>
              <div className="relative">
                <select value={condition} onChange={(e) => { setCondition(e.target.value); setPage(1) }}
                  className="input-field pr-8 appearance-none text-sm">
                  <option value="">Cualquier estado</option>
                  {CONDITIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              </div>
            </div>

            {/* Province */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5 uppercase tracking-wide">Provincia</label>
              <div className="relative">
                <select value={province} onChange={(e) => { setProvince(e.target.value); setPage(1) }}
                  className="input-field pr-8 appearance-none text-sm">
                  <option value="">Todo el país</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5 uppercase tracking-wide">Precio (ARS)</label>
              <div className="flex gap-2">
                <input type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1) }}
                  placeholder="Mín" className="input-field text-sm py-2 px-3 w-1/2" />
                <input type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
                  placeholder="Máx" className="input-field text-sm py-2 px-3 w-1/2" />
              </div>
            </div>
          </div>

          {/* Shipping toggle */}
          <div className="mt-4 pt-4 border-t border-paper-100">
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <div
                onClick={() => { setOnlyShipping(!onlyShipping); setPage(1) }}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${onlyShipping ? 'bg-forest-600' : 'bg-paper-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${onlyShipping ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-ink-700 font-medium">Solo con envío a domicilio</span>
            </label>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-sm">
              {categories.find(c => c.slug === category)?.name}
              <button onClick={() => { setCategory(''); setPage(1) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {condition && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-sm">
              {CONDITIONS.find(c => c.value === condition)?.label}
              <button onClick={() => { setCondition(''); setPage(1) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {province && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-sm">
              {province}
              <button onClick={() => { setProvince(''); setPage(1) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-sm">
              ${minPrice || '0'} – ${maxPrice || '∞'}
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {onlyShipping && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-sm">
              Con envío
              <button onClick={() => { setOnlyShipping(false); setPage(1) }}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Books grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📚</p>
          <h3 className="font-display text-xl font-bold text-ink-700 mb-2">No encontramos libros</h3>
          <p className="text-ink-500 mb-4">Intentá con otros filtros o términos de búsqueda</p>
          <button onClick={clearFilters} className="btn-secondary">Limpiar filtros</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Anterior
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = Math.max(1, Math.min(pages - 4, page - 2)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                      p === page ? 'bg-forest-600 text-white' : 'btn-secondary'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
