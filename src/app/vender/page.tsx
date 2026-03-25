// src/app/vender/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
  Upload, X, Plus, BookOpen, DollarSign,
  Truck, Info, ChevronRight, Loader2
} from 'lucide-react'

const bookSchema = z.object({
  title: z.string().min(2, 'El título es muy corto').max(200),
  author: z.string().min(2, 'El autor es muy corto').max(200),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  price: z.number({ invalid_type_error: 'Ingresá un precio válido' }).positive('El precio debe ser positivo'),
  originalPrice: z.number().positive().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  categoryId: z.string().min(1, 'Seleccioná una categoría'),
  shippingModes: z.array(z.string()).min(1, 'Seleccioná al menos una opción de entrega'),
  shippingCost: z.number().min(0).optional(),
})

type BookFormData = z.infer<typeof bookSchema>

const CONDITIONS = [
  { value: 'NEW', label: 'Nuevo', desc: 'Sin uso, en perfectas condiciones' },
  { value: 'LIKE_NEW', label: 'Como nuevo', desc: 'Muy poco uso, sin marcas' },
  { value: 'GOOD', label: 'Bueno', desc: 'Uso normal, algunas marcas' },
  { value: 'FAIR', label: 'Regular', desc: 'Uso intenso, pero legible' },
  { value: 'POOR', label: 'Deteriorado', desc: 'Daños visibles, aún funcional' },
]

const SHIPPING_OPTIONS = [
  { value: 'OCA_E_PAK', label: 'OCA e-Pak (puerta a puerta)', desc: 'El comprador recibe en su domicilio' },
  { value: 'OCA_SUCURSAL', label: 'OCA a sucursal', desc: 'El comprador retira en sucursal OCA' },
  { value: 'CORREO_ARGENTINO', label: 'Correo Argentino', desc: 'Envío por correo' },
  { value: 'PERSONAL_DELIVERY', label: 'Entrega personal', desc: 'Coordinás con el comprador' },
  { value: 'MEET_IN_PERSON', label: 'Encuentro en persona', desc: 'Se encuentran en un punto acordado' },
]

export default function SellPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: { shippingModes: [], condition: 'GOOD' },
  })

  const watchedShippingModes = watch('shippingModes')
  const watchedCondition = watch('condition')

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/auth/login?redirect=/vender')
    return null
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 8) {
      toast.error('Máximo 8 fotos por publicación')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const toggleShipping = (value: string) => {
    const current = watchedShippingModes
    if (current.includes(value)) {
      setValue('shippingModes', current.filter((v) => v !== value))
    } else {
      setValue('shippingModes', [...current, value])
    }
  }

  const onSubmit = async (data: BookFormData) => {
    if (images.length === 0) {
      toast.error('Agregá al menos una foto del libro')
      return
    }

    setUploading(true)
    try {
      // 1. Upload images to Cloudinary
      const uploadedUrls: string[] = []
      for (const image of images) {
        const formData = new FormData()
        formData.append('file', image)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const { url } = await res.json()
        uploadedUrls.push(url)
      }

      // 2. Create book listing
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, images: uploadedUrls }),
      })

      if (!res.ok) throw new Error('Error al publicar')

      const { book } = await res.json()
      toast.success('¡Libro publicado exitosamente!')
      router.push(`/libros/${book.id}`)
    } catch (error) {
      toast.error('Error al publicar el libro. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="container-main py-10 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-2">
            Publicar un libro
          </h1>
          <p className="text-ink-500">
            Completá los datos y empezá a vender. La publicación es gratis.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Fotos', 'Datos del libro', 'Precio y envío'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-forest-600' : step === i + 1 ? 'text-ink-800' : 'text-ink-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  step > i + 1
                    ? 'bg-forest-600 border-forest-600 text-white'
                    : step === i + 1
                    ? 'border-forest-600 text-forest-600'
                    : 'border-paper-300 text-ink-400'
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-paper-400 shrink-0" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Photos */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-forest-600" />
              </div>
              <h2 className="text-lg font-display font-bold text-ink-800">Fotos del libro</h2>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border border-paper-200" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Principal</span>
                  )}
                </div>
              ))}

              {images.length < 8 && (
                <label className="aspect-square border-2 border-dashed border-paper-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-forest-400 hover:bg-forest-50 transition-colors">
                  <Plus className="w-6 h-6 text-ink-400" />
                  <span className="text-xs text-ink-500 text-center">Agregar foto</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <p className="text-xs text-ink-500 mt-3 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Agregá hasta 8 fotos. La primera será la foto principal.
            </p>
          </div>

          {/* Step 2: Book data */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-forest-600" />
              </div>
              <h2 className="text-lg font-display font-bold text-ink-800">Datos del libro</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input {...register('title')} className="input-field" placeholder="Ej: El Aleph" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Autor <span className="text-red-500">*</span>
                </label>
                <input {...register('author')} className="input-field" placeholder="Ej: Jorge Luis Borges" />
                {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">ISBN</label>
                <input {...register('isbn')} className="input-field" placeholder="978-..." />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Contá el estado del libro, si tiene subrayados, si le faltan páginas, etc."
                />
              </div>

              {/* Condition */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-700 mb-2">
                  Estado del libro <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {CONDITIONS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('condition', value as any)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        watchedCondition === value
                          ? 'border-forest-500 bg-forest-50'
                          : 'border-paper-200 hover:border-paper-400'
                      }`}
                    >
                      <p className="text-sm font-semibold text-ink-800">{label}</p>
                      <p className="text-xs text-ink-500 mt-0.5 leading-tight">{desc}</p>
                    </button>
                  ))}
                </div>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
              </div>
            </div>
          </div>

          {/* Step 3: Price and shipping */}
          <div className="bg-white rounded-2xl border border-paper-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-forest-600" />
              </div>
              <h2 className="text-lg font-display font-bold text-ink-800">Precio y envío</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Precio de venta (ARS) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">$</span>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    className="input-field pl-7"
                    placeholder="3500"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Precio original (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">$</span>
                  <input
                    {...register('originalPrice', { valueAsNumber: true })}
                    type="number"
                    className="input-field pl-7"
                    placeholder="6000"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Opciones de entrega <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {SHIPPING_OPTIONS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleShipping(value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      watchedShippingModes.includes(value)
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-paper-200 hover:border-paper-400'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      watchedShippingModes.includes(value)
                        ? 'bg-forest-600 border-forest-600'
                        : 'border-paper-400'
                    }`}>
                      {watchedShippingModes.includes(value) && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{label}</p>
                      <p className="text-xs text-ink-500">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.shippingModes && (
                <p className="text-red-500 text-xs mt-1">{errors.shippingModes.message}</p>
              )}
            </div>

            {/* Platform fee notice */}
            <div className="mt-6 p-4 bg-paper-100 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-ink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-ink-700">Comisión de la plataforma</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  BiblioMarket cobra un 8% sobre el precio de venta. Este monto se descuenta automáticamente
                  del pago que recibís via MercadoPago.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="btn-primary flex-1 justify-center"
            >
              {(isSubmitting || uploading) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploading ? 'Subiendo imágenes...' : 'Publicando...'}
                </>
              ) : (
                'Publicar libro'
              )}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  )
}
