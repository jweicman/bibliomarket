// src/components/layout/navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import {
  Search, BookOpen, Bell, ShoppingBag, User, LogOut,
  LayoutDashboard, Plus, Heart, Package, Menu, X, ChevronDown
} from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/libros?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-paper-50/95 backdrop-blur-sm shadow-sm border-b border-paper-200'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-main">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-paper-50" />
            </div>
            <span className="font-display text-xl font-bold text-ink-800 hidden sm:block">
              Biblio<span className="text-forest-600">Market</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar título, autor, ISBN..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-paper-300 rounded-lg text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 transition-colors"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/libros" className="btn-ghost text-sm">
              Explorar
            </Link>
            <Link href="/categorias" className="btn-ghost text-sm">
              Categorías
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {session ? (
              <>
                {/* Sell button */}
                <Link href="/vender" className="btn-primary hidden sm:inline-flex">
                  <Plus className="w-4 h-4" />
                  Publicar
                </Link>

                {/* Notifications */}
                <button className="relative btn-ghost p-2">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 btn-ghost px-2 py-1.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-forest-600 flex items-center justify-center text-paper-50 text-xs font-semibold overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (session.user?.name?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 text-ink-500 hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-paper-200 py-2 z-20 animate-fade-up">
                        <div className="px-4 py-2 border-b border-paper-100">
                          <p className="text-sm font-semibold text-ink-800">{session.user?.name}</p>
                          <p className="text-xs text-ink-500 truncate">{session.user?.email}</p>
                        </div>
                        {[
                          { icon: LayoutDashboard, label: 'Mi panel', href: '/dashboard' },
                          { icon: Package, label: 'Mis compras', href: '/dashboard/compras' },
                          { icon: ShoppingBag, label: 'Mis ventas', href: '/dashboard/ventas' },
                          { icon: Heart, label: 'Favoritos', href: '/dashboard/favoritos' },
                          { icon: User, label: 'Mi perfil', href: '/dashboard/perfil' },
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-ink-500" />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-paper-100 mt-1 pt-1">
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm">
                  Ingresar
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost p-2"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-paper-200 py-4 space-y-1">
            {[
              { label: 'Explorar libros', href: '/libros' },
              { label: 'Categorías', href: '/categorias' },
              { label: 'Cómo funciona', href: '/como-funciona' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-paper-100 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            {session && (
              <Link
                href="/vender"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-forest-700 hover:bg-forest-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                <Plus className="w-4 h-4" />
                Publicar un libro
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
