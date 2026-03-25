// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentInfo, mapMPStatus } from '@/lib/mercadopago'
import { createOCAShipment } from '@/lib/oca'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    console.log('MP Webhook received:', type, data)

    if (type === 'payment') {
      const paymentId = data.id
      const payment = await getPaymentInfo(String(paymentId))

      const orderId = payment.external_reference
      if (!orderId) return NextResponse.json({ ok: true })

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          book: true,
          buyer: true,
          seller: true,
        },
      })

      if (!order) return NextResponse.json({ ok: true })

      const paymentStatus = mapMPStatus(payment.status || 'pending')

      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          paymentId: String(paymentId),
          paymentMethod: 'MERCADO_PAGO',
          paidAt: paymentStatus === 'APPROVED' ? new Date() : undefined,
          status: paymentStatus === 'APPROVED' ? 'PAYMENT_CONFIRMED' : 
                  paymentStatus === 'REJECTED' ? 'CANCELLED' : 
                  order.status,
        },
      })

      if (paymentStatus === 'APPROVED') {
        // Mark book as sold
        await prisma.book.update({
          where: { id: order.bookId },
          data: { status: 'SOLD' },
        })

        // Notify buyer
        await prisma.notification.create({
          data: {
            userId: order.buyerId,
            type: 'ORDER_PAYMENT_CONFIRMED',
            title: 'Pago confirmado',
            body: `Tu pago por "${order.book.title}" fue aprobado. El vendedor preparará el envío.`,
            orderId: order.id,
          },
        })

        // Notify seller
        await prisma.notification.create({
          data: {
            userId: order.sellerId,
            type: 'ORDER_PAYMENT_CONFIRMED',
            title: 'Pago recibido - preparar envío',
            body: `El pago de "${order.book.title}" fue confirmado. Por favor preparalo para enviar.`,
            orderId: order.id,
          },
        })

        // Auto-create OCA shipment if mode is OCA
        if (
          order.shippingMode &&
          ['OCA_E_PAK', 'OCA_SUCURSAL'].includes(order.shippingMode) &&
          order.seller.postalCode &&
          order.buyer.postalCode
        ) {
          const shippingAddress = order.shippingAddress as any

          const ocaResult = await createOCAShipment({
            cuentaCorreo: process.env.OCA_CUENTA_CORRIENTE!,
            operativa: process.env.OCA_OPERATIVA!,
            origen: {
              calle: order.seller.street || '',
              numero: order.seller.streetNumber || '',
              cp: order.seller.postalCode,
              localidad: order.seller.city || '',
              provincia: order.seller.province || '',
              contacto: order.seller.name || '',
              email: order.seller.email,
              telefono: order.seller.phone || '',
            },
            destino: {
              calle: shippingAddress?.street || '',
              numero: shippingAddress?.streetNumber || '',
              apartment: shippingAddress?.apartment,
              cp: order.buyer.postalCode || '',
              localidad: shippingAddress?.city || '',
              provincia: shippingAddress?.province || '',
              contacto: shippingAddress?.name || order.buyer.name || '',
              email: order.buyer.email,
              telefono: shippingAddress?.phone || order.buyer.phone || '',
            },
            paquete: {
              alto: 20,
              ancho: 20,
              largo: 5,
              peso: 1,
              valorDeclarado: order.bookPrice,
            },
            referencias: {
              nroRemito: order.id.slice(0, 12),
              descripcion: `BiblioMarket - ${order.book.title}`,
            },
          })

          if (ocaResult.success && ocaResult.guideNumber) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                ocaGuideNumber: ocaResult.guideNumber,
                trackingNumber: ocaResult.guideNumber,
                status: 'PREPARING',
              },
            })
          }
        }
      } else if (paymentStatus === 'REJECTED' || paymentStatus === 'CANCELLED') {
        // Re-activate book listing
        await prisma.book.update({
          where: { id: order.bookId },
          data: { status: 'ACTIVE' },
        })

        await prisma.notification.create({
          data: {
            userId: order.buyerId,
            type: 'SYSTEM',
            title: 'Pago rechazado',
            body: `El pago por "${order.book.title}" fue rechazado. Podés intentarlo de nuevo.`,
            orderId: order.id,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}
