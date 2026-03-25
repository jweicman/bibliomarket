// src/components/home/hero.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, BookOpen, Users, Package, Star } from 'lucide-react'

interface HeroProps {
  stats: [number, number, number] // [books, users, orders]
}

const POPULAR_SEARCHES = [
  'Derecho Civil', 'Biología', 'Harry Potter', 'Matemáticas', 'Historia', 'Programación'
]

export function Hero({ stats }: HeroProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/libros?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative overflow-hidden min-h-[580px] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-forest-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-accent-100/30 blur-3xl" />
        {/* Book stack decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 opacity-20">
          {['#2d7a20','#c8954e','#342818','#4a9440','#b07a38'].map((color, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: `${80 - i * 8}px`,
                height: '20px',
                backgroundColor: color,
                transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (i + 1)}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container-main relative z-10 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-100 text-forest-800 rounded-full text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
            Marketplace de libros en Argentina
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink-900 leading-tight mb-6">
            Donde los libros{' '}
            <span className="relative">
              <span className="text-forest-600">encuentran</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path
                  d="M2 10 Q75 2 150 8 Q225 14 298 6"
                  stroke="#2d7a20"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </span>{' '}
            otro lector
          </h1>

          <p className="text-lg text-ink-600 mb-8 max-w-xl leading-relaxed">
            Comprá y vendé libros usados de forma segura. 
            Pagá con MercadoPago y recibilo por OCA en todo el país.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-6 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué libro buscás?"
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-paper-300 rounded-xl text-ink-800 text-base focus:outline-none focus:border-forest-500 transition-colors shadow-sm"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3.5 text-base rounded-xl">
              Buscar
            </button>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap gap-2 mb-12">
            <span className="text-sm text-ink-500">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => router.push(`/libros?q=${encodeURIComponent(term)}`)}
                className="text-sm px-3 py-1 bg-paper-100 hover:bg-paper-200 text-ink-600 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { icon: BookOpen, value: stats[0].toLocaleString('es-AR'), label: 'libros publicados' },
              { icon: Users, value: stats[1].toLocaleString('es-AR'), label: 'lectores registrados' },
              { icon: Package, value: stats[2].toLocaleString('es-AR'), label: 'ventas exitosas' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-ink-800">{value}</p>
                  <p className="text-xs text-ink-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
