// src/app/api/books/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { order: 'asc' } },
      seller: { select: { id: true, name: true, avatar: true, rating: true, totalRatings: true, city: true, province: true, postalCode: true, createdAt: true } },
      category: true,
      _count: { select: { favorites: true } },
    },
  })

  if (!book) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ book })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Only owner or admin can update
  if (book.sellerId !== session.user.id && (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const data = await req.json()

  // Whitelist updatable fields
  const allowedFields = ['title', 'author', 'isbn', 'description', 'price', 'originalPrice', 'condition', 'categoryId', 'shippingModes', 'shippingCost', 'status']
  const updateData: Record<string, any> = {}
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key]
  }

  const updated = await prisma.book.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json({ book: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const book = await prisma.book.findUnique({ where: { id: params.id } })
  if (!book) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (book.sellerId !== session.user.id && (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  await prisma.book.update({ where: { id: params.id }, data: { status: 'DELETED' } })
  return NextResponse.json({ ok: true })
}
