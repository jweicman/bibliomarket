export const dynamic = 'force-dynamic'

// src/app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createBookSchema = z.object({
  title: z.string().min(2).max(200),
  author: z.string().min(2).max(200),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  categoryId: z.string(),
  shippingModes: z.array(z.string()),
  shippingCost: z.number().min(0).optional(),
  images: z.array(z.string()).min(1).max(8),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const condition = searchParams.get('condition') || ''
  const province = searchParams.get('province') || ''
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort') || 'recent'
  const shipping = searchParams.get('shipping') // 'true' = only with shipping

  const where: any = { status: 'ACTIVE' }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
      { isbn: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (category) where.category = { slug: category }
  if (condition) where.condition = condition
  if (province) where.province = { contains: province, mode: 'insensitive' }
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }
  if (shipping === 'true') {
    where.shippingModes = { hasSome: ['OCA_E_PAK', 'OCA_SUCURSAL', 'CORREO_ARGENTINO'] }
  }

  const orderBy: any =
    sort === 'price_asc' ? { price: 'asc' }
    : sort === 'price_desc' ? { price: 'desc' }
    : sort === 'popular' ? { views: 'desc' }
    : { publishedAt: 'desc' }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        seller: { select: { id: true, name: true, rating: true, city: true, province: true } },
        category: true,
        _count: { select: { favorites: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.book.count({ where }),
  ])

  return NextResponse.json({
    books,
    total,
    pages: Math.ceil(total / limit),
    page,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const data = createBookSchema.parse(body)

    // Get seller location for book
    const seller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { city: true, province: true },
    })

    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        condition: data.condition as any,
        categoryId: data.categoryId,
        sellerId: session.user.id,
        shippingModes: data.shippingModes as any[],
        shippingCost: data.shippingCost,
        city: seller?.city,
        province: seller?.province,
        images: {
          create: data.images.map((url, i) => ({ url, order: i })),
        },
      },
      include: { images: true, category: true },
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }
    console.error('Error creating book:', error)
    return NextResponse.json({ error: 'Error al crear la publicación' }, { status: 500 })
  }
}
