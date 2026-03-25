// src/app/dashboard/perfil/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { User, MapPin, Phone, Lock, Loader2, Save } from 'lucide-react'
const PROVINCES = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza',
  'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Chaco',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro',
  'Neuquén', 'Formosa', 'Chubut', 'San Luis', 'Catamarca',
  'La Rioja', 'La Pampa', 'Santa Cruz', 'Corrientes', 'Tierra del Fuego',
]
export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<any>()
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') {
      fetch('/api/users/me')
        .then(r => r.json())
        .then(({ user }) => { reset(user); setLoading(false) })
    }
  }, [status])
  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Perfil actualizado')
        reset(data)
      } else {
        toast.error('Error al guardar')
      }
    } finally {
      setSaving(false)
    }
  }
  if (loading) return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
      </div>
    </>
  )
  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-6">Mi perfil</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal data */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-forest-600" />
              <h2 className="font-display font-bold text-ink-800">Datos personales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Nombre completo</label>
                <input {...register('name', { required: true })} className="input-field" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
                <input type="email" disabled className="input-field opacity-60 cursor-not-allowed"
                  value={session?.user?.email || ''} />
                <p className="text-xs text-ink-400 mt-1">El email no se puede cambiar</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Teléfono / WhatsApp
                </label>
                <input {...register('phone')} className="input-field" placeholder="+54 11 1234-5678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">DNI (opcional)</label>
                <input {...register('dni')} className="input-field" placeholder="Ej: 30123456" />
              </div>
            </div>
          </div>
          {/* Address */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-forest-600" />
              <h2 className="font-display font-bold text-ink-800">Dirección de envío</h2>
            </div>
            <p className="text-sm text-ink-500 mb-4">
              Esta dirección se usará para generar guías OCA cuando vendas libros.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Calle</label>
                <input {...register('street')} className="input-field" placeholder="Av. Corrientes" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Número</label>
                <input {...register('streetNumber')} className="input-field" placeholder="1234" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Piso/Depto</label>
                <input {...register('apartment')} className="input-field" placeholder="3B (opcional)" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Código postal</label>
                <input {...register('postalCode')} className="input-field" placeholder="1414" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Ciudad</label>
                <input {...register('city')} className="input-field" placeholder="Buenos Aires" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Provincia</label>
                <select {...register('province')} className="input-field">
                  <option value="">Seleccioná una provincia</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          {/* Save button */}
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="w-full btn-primary justify-center py-3 text-base rounded-xl disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar cambios</>
            )}
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}
