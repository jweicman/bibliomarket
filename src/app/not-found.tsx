// src/app/not-found.tsx
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container-main py-20 text-center">
        <p className="text-8xl mb-6">📚</p>
        <h1 className="font-display text-4xl font-bold text-ink-900 mb-3">Página no encontrada</h1>
        <p className="text-ink-500 mb-8 max-w-md mx-auto">
          La página que buscás no existe o fue eliminada. Explorá nuestro catálogo de libros.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">Ir al inicio</Link>
          <Link href="/libros" className="btn-secondary">Ver libros</Link>
        </div>
      </main>
    </>
  )
}
