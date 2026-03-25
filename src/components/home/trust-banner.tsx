// src/components/home/trust-banner.tsx
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react'

export function TrustBanner() {
  const items = [
    { icon: ShieldCheck, title: 'Pago seguro', desc: 'MercadoPago protege tu compra' },
    { icon: Truck, title: 'Envío a todo el país', desc: 'Por OCA o Correo Argentino' },
    { icon: RefreshCw, title: 'Devoluciones', desc: 'Si el libro no es lo publicado' },
    { icon: Headphones, title: 'Soporte', desc: 'Te ayudamos ante cualquier problema' },
  ]

  return (
    <section className="bg-white border-y border-paper-200">
      <div className="container-main py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-forest-700" />
              </div>
              <div>
                <p className="font-semibold text-ink-800 text-sm">{title}</p>
                <p className="text-xs text-ink-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


// src/components/home/featured-packs.tsx — exported from same file for simplicity
export function FeaturedPacks() {
  // This section would show curated "packs" (bundles of books)
  // For now, a CTA for sellers
  return (
    <section className="container-main py-16">
      <div className="bg-forest-700 rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-8 overflow-hidden relative">
        {/* Decoration */}
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-forest-600/50 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-forest-800/50 blur-2xl pointer-events-none" />

        <div className="relative z-10 text-center lg:text-left">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-paper-50 mb-3">
            ¿Tenés libros sin usar?
          </h2>
          <p className="text-forest-200 text-lg max-w-md">
            Publicá gratis y llegá a miles de lectores. El proceso tarda menos de 5 minutos.
          </p>
        </div>

        <div className="relative z-10 flex gap-3 shrink-0">
          <a href="/vender"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-paper-50 text-forest-800 font-bold rounded-xl text-base hover:bg-white transition-colors">
            Publicar un libro
          </a>
          <a href="/como-funciona"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-forest-600 text-paper-100 font-semibold rounded-xl text-base hover:bg-forest-500 transition-colors">
            Saber más
          </a>
        </div>
      </div>
    </section>
  )
}
