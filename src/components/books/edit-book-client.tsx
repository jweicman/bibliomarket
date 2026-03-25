// src/components/books/edit-book-client.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'

const CONDITIONS = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'LIKE_NEW', label: 'Como nuevo' },
  { value: 'GOOD', label: 'Bueno' },
  { value: 'FAIR', label: 'Regular' },
  { value: 'POOR', label: 'Deteriorado' },
]

const SHIPPING_OPTIONS = [
  { value: 'OCA_E_PAK', label: 'OCA e-Pak (puerta a puerta)' },
  { value: 'OCA_SUCURSAL', label: 'OCA a sucursal' },
  { value: 'CORREO_ARGENTINO', label: 'Correo Argentino' },
  { value: 'PERSONAL_DELIVERY', label: 'Entrega personal' },
  { value: 'MEET_IN_PERSON', label: 'Encuentro en persona' },
]

export function EditBookClient({ book, categories }: { book: any; categories: any[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [shippingModes, setShippingModes] = useState<string[]>(book.shippingModes || [])

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      description: book.description || '',
      price: book.price,
      originalPrice: book.originalPrice || '',
      condition: book.condition,
      categoryId: book.categoryId,
      shippingCost: book.shippingCost || '',
    },
  })

  const toggleShipping = (value: string) => {
    setShippingModes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const onSubmit = async (data: any) => {
    if (shippingModes.length === 0) {
      toast.error('Seleccioná al menos una opción de entrega')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
          shippingCost: data.shippingCost ? parseFloat(data.shippingCost) : undefined,
          shippingModes,
        }),
      })
      if (res.ok) {
        toast.success('Publicación actualizada')
        router.push(`/libros/${book.id}`)
      } else {
        toast.error('Error al guardar')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-2xl border border-paper-200 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Título *</label>
            <input {...register('title', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Autor *</label>
            <input {...register('author', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">ISBN</label>
            <input {...register('isbn')} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Descripción</label>
            <textarea {...register('description')} rows={4} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Estado *</label>
            <select {...register('condition')} className="input-field">
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Categoría *</label>
            <select {...register('categoryId', { required: true })} className="input-field">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Precio (ARS) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">$</span>
              <input {...register('price', { required: true })} type="number" className="input-field pl-7" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Precio original (opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">$</span>
              <input {...register('originalPrice')} type="number" className="input-field pl-7" />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-2">Opciones de entrega *</label>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => toggleShipping(value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  shippingModes.includes(value) ? 'border-forest-500 bg-forest-50' : 'border-paper-200 hover:border-paper-400'
                }`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  shippingModes.includes(value) ? 'bg-forest-600 border-forest-600' : 'border-paper-400'
                }`}>
                  {shippingModes.includes(value) && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-ink-800">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar cambios</>}
        </button>
      </div>
    </form>
  )
}
