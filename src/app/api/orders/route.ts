export const dynamic = 'force-dynamic'

// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { bookId, shippingMode } = await req.json()

    // Get book with seller info
    const book = await prisma.book.findUnique({
      where: { id: bookId, status: 'ACTIVE' },
      include: { seller: true },
    })

    if (!book) {
      return NextResponse.json({ error: 'Libro no disponible' }, { status: 404 })
    }

    if (book.sellerId === session.user.id) {
      return NextResponse.json({ error: 'No podés comprar tu propio libro' }, { status: 400 })
    }

    const platformFeePercent = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT || '8')
    const platformFee = Math.round(book.price * (platformFeePercent / 100) * 100) / 100
    const shippingCost = book.shippingCost || 0
    const total = book.price + shippingCost

    // Get buyer info for address snapshot
    const buyer = await prisma.user.findUnique({ where: { id: session.user.id } })

    // Create order
    const order = await prisma.order.create({
      data: {
        bookId: book.id,
        buyerId: session.user.id,
        sellerId: book.sellerId,
        bookPrice: book.price,
        shippingCost,
        platformFee,
        total,
        shippingMode: shippingMode || (book.shippingModes[0] as any),
        shippingAddress: buyer
          ? {
              name: buyer.name,
              street: buyer.street,
              streetNumber: buyer.streetNumber,
              apartment: buyer.apartment,
              city: buyer.city,
              province: buyer.province,
              postalCode: buyer.postalCode,
              phone: buyer.phone,
            }
          : null,
      },
    })

    // Mark book as paused to prevent double purchase
    await prisma.book.update({
      where: { id: bookId },
      data: { status: 'PAUSED' },
    })

    // Create MercadoPago preference
    const preference = await createPaymentPreference({
      orderId: order.id,
      bookTitle: book.title,
      bookPrice: book.price,
      shippingCost,
      platformFee,
      buyerEmail: session.user.email!,
      sellerId: book.sellerId,
    })

    // Save preference ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: preference.id },
    })

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: book.sellerId,
        type: 'ORDER_NEW',
        title: 'Nueva solicitud de compra',
        body: `${session.user.name || 'Un usuario'} quiere comprar "${book.title}"`,
        orderId: order.id,
      },
    })

    return NextResponse.json({
      order,
      preferenceUrl: preference.sandbox_init_point, // Use init_point for production
      preferenceId: preference.id,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error al procesar la orden' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'purchases' // purchases | sales

    const orders = await prisma.order.findMany({
      where:
        type === 'sales'
          ? { sellerId: session.user.id }
          : { buyerId: session.user.id },
      include: {
        book: {
          include: { images: { take: 1, orderBy: { order: 'asc' } } },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}
