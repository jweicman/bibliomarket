// src/components/layout/footer.tsx
import Link from 'next/link'
import { BookOpen, Mail, Phone, Instagram, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-ink-900 text-paper-200 mt-20">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-forest-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-paper-50">
                Biblio<span className="text-forest-400">Market</span>
              </span>
            </Link>
            <p className="text-sm text-paper-400 leading-relaxed mb-4">
              El marketplace de libros usados más grande de Argentina. Comprá y vendé de forma segura.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/bibliomarket" target="_blank" rel="noopener" className="w-8 h-8 bg-ink-800 rounded-lg flex items-center justify-center hover:bg-forest-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/bibliomarket" target="_blank" rel="noopener" className="w-8 h-8 bg-ink-800 rounded-lg flex items-center justify-center hover:bg-forest-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-paper-100 mb-3 text-sm">Explorar</h4>
            <ul className="space-y-2">
              {[
                { label: 'Todos los libros', href: '/libros' },
                { label: 'Categorías', href: '/categorias' },
                { label: 'Más vendidos', href: '/libros?sort=popular' },
                { label: 'Nuevas publicaciones', href: '/libros?sort=recent' },
                { label: 'Publicar un libro', href: '/vender' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-paper-400 hover:text-paper-100 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-paper-100 mb-3 text-sm">Información</h4>
            <ul className="space-y-2">
              {[
                { label: 'Cómo funciona', href: '/como-funciona' },
                { label: 'Sobre nosotros', href: '/sobre-nosotros' },
                { label: 'Términos y condiciones', href: '/terminos' },
                { label: 'Política de privacidad', href: '/privacidad' },
                { label: 'Preguntas frecuentes', href: '/faq' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-paper-400 hover:text-paper-100 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-paper-100 mb-3 text-sm">Contacto</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:soporte@bibliomarket.com.ar" className="text-sm text-paper-400 hover:text-paper-100 flex items-center gap-2 transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  soporte@bibliomarket.com.ar
                </a>
              </li>
              <li>
                <a href="https://wa.me/5491128734252" className="text-sm text-paper-400 hover:text-paper-100 flex items-center gap-2 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  +54 11 2873-4252
                </a>
              </li>
            </ul>

            {/* Payment logos */}
            <div className="mt-6">
              <p className="text-xs text-paper-500 mb-2 uppercase tracking-wide font-semibold">Trabajamos con</p>
              <div className="flex gap-3 items-center">
                <div className="bg-ink-800 rounded px-2 py-1 text-xs font-bold text-[#00b1ea]">MercadoPago</div>
                <div className="bg-ink-800 rounded px-2 py-1 text-xs font-bold text-paper-300">OCA</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-paper-500">
            © {new Date().getFullYear()} BiblioMarket. Todos los derechos reservados.
          </p>
          <p className="text-xs text-paper-600">
            Hecho con ❤️ para lectores argentinos
          </p>
        </div>
      </div>
    </footer>
  )
}
