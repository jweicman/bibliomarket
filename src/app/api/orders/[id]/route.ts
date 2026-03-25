// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      book: { include: { images: { take: 1, orderBy: { order: 'asc' } }, category: true } },
      buyer: { select: { id: true, name: true, email: true, avatar: true, phone: true, city: true, province: true } },
      seller: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      review: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  // Only buyer, seller, or admin can view
  if (order.buyerId !== session.user.id && order.sellerId !== session.user.id && (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  return NextResponse.json({ order })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const data = await req.json()

  // Only seller can update status to SHIPPED/PREPARING; buyer to confirm DELIVERED
  if (data.status === 'SHIPPED' || data.status === 'PREPARING') {
    if (order.sellerId !== session.user.id) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }
  if (data.status === 'DELIVERED') {
    if (order.buyerId !== session.user.id) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: {
      ...( data.status && { status: data.status }),
      ...( data.trackingNumber && { trackingNumber: data.trackingNumber }),
      ...( data.status === 'SHIPPED' && { shippedAt: new Date() }),
      ...( data.status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
  })

  // Notify the other party
  if (data.status === 'SHIPPED') {
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: 'ORDER_SHIPPED',
        title: '¡Tu libro está en camino!',
        body: `El vendedor despachó el libro. Número de guía: ${data.trackingNumber || 'ver pedido'}`,
        orderId: order.id,
      },
    })
  }

  if (data.status === 'DELIVERED') {
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: 'ORDER_DELIVERED',
        title: 'Entrega confirmada',
        body: 'El comprador confirmó que recibió el libro.',
        orderId: order.id,
      },
    })
  }

  return NextResponse.json({ order: updated })
}
