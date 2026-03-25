// src/components/home/how-it-works.tsx
import { UserPlus, BookOpen, CreditCard, Package } from 'lucide-react'

const STEPS = [
  {
    icon: UserPlus,
    title: 'Creá tu cuenta',
    desc: 'Registrate gratis en segundos con tu email o Google.',
    color: 'bg-forest-100 text-forest-700',
    num: '01',
  },
  {
    icon: BookOpen,
    title: 'Publicá o explorá',
    desc: 'Subí tus libros con fotos o buscá lo que necesitás entre miles de títulos.',
    color: 'bg-blue-100 text-blue-700',
    num: '02',
  },
  {
    icon: CreditCard,
    title: 'Pagá seguro',
    desc: 'Comprá con tarjeta, débito o efectivo a través de MercadoPago.',
    color: 'bg-amber-100 text-amber-700',
    num: '03',
  },
  {
    icon: Package,
    title: 'Recibí en casa',
    desc: 'El vendedor despacha por OCA y rastreás el envío en tiempo real.',
    color: 'bg-purple-100 text-purple-700',
    num: '04',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-ink-900">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-paper-50 mb-3">
            ¿Cómo funciona?
          </h2>
          <p className="text-paper-400 max-w-xl mx-auto">
            Comprar y vender libros nunca fue tan fácil y seguro
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon: Icon, title, desc, color, num }, i) => (
            <div key={num} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-ink-700 -translate-x-4 z-0" />
              )}

              <div className="relative z-10 bg-ink-800 rounded-2xl p-6 border border-ink-700 hover:border-ink-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-ink-600 text-sm font-bold">{num}</span>
                </div>
                <h3 className="font-display font-bold text-paper-100 text-lg mb-2">{title}</h3>
                <p className="text-paper-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
