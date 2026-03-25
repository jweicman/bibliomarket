export const dynamic = 'force-dynamic'

// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const data = reviewSchema.parse(await req.json())

    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { review: true },
    })

    if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    if (order.buyerId !== session.user.id) return NextResponse.json({ error: 'Solo el comprador puede calificar' }, { status: 403 })
    if (order.status !== 'DELIVERED') return NextResponse.json({ error: 'Solo podés calificar después de recibir el libro' }, { status: 400 })
    if (order.review) return NextResponse.json({ error: 'Ya calificaste esta compra' }, { status: 409 })

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId: data.orderId,
        reviewerId: session.user.id,
        reviewedId: order.sellerId,
        rating: data.rating,
        comment: data.comment,
      },
    })

    // Recalculate seller rating
    const allReviews = await prisma.review.findMany({
      where: { reviewedId: order.sellerId },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.user.update({
      where: { id: order.sellerId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: allReviews.length,
      },
    })

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: 'REVIEW_NEW',
        title: `Nueva calificación: ${'⭐'.repeat(data.rating)}`,
        body: data.comment || `Recibiste una calificación de ${data.rating} estrellas`,
        orderId: order.id,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 })
    return NextResponse.json({ error: 'Error al crear la calificación' }, { status: 500 })
  }
}
