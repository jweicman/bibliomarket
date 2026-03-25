// src/lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
})

export const preferenceClient = new Preference(client)
export const paymentClient = new Payment(client)

export interface CreatePreferenceParams {
  orderId: string
  bookTitle: string
  bookPrice: number
  shippingCost: number
  platformFee: number
  buyerEmail: string
  sellerId: string
}

/**
 * Crea una preferencia de pago en MercadoPago
 * La plataforma cobra una comisión automáticamente via Marketplace
 */
export async function createPaymentPreference(params: CreatePreferenceParams) {
  const {
    orderId,
    bookTitle,
    bookPrice,
    shippingCost,
    platformFee,
    buyerEmail,
  } = params

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const preference = await preferenceClient.create({
    body: {
      external_reference: orderId,
      items: [
        {
          id: orderId,
          title: bookTitle,
          quantity: 1,
          unit_price: bookPrice,
          currency_id: 'ARS',
          category_id: 'books',
        },
        ...(shippingCost > 0
          ? [
              {
                id: `shipping-${orderId}`,
                title: 'Costo de envío',
                quantity: 1,
                unit_price: shippingCost,
                currency_id: 'ARS',
              },
            ]
          : []),
      ],
      payer: {
        email: buyerEmail,
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 1, // Sin cuotas para marketplace C2C
      },
      back_urls: {
        success: `${appUrl}/checkout/success?order=${orderId}`,
        failure: `${appUrl}/checkout/failure?order=${orderId}`,
        pending: `${appUrl}/checkout/pending?order=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/payments/webhook`,
      marketplace_fee: platformFee,
      statement_descriptor: 'BIBLIOMARKET',
      expires: false,
    },
  })

  return preference
}

/**
 * Verifica y procesa el webhook de MercadoPago
 */
export async function getPaymentInfo(paymentId: string) {
  const payment = await paymentClient.get({ id: paymentId })
  return payment
}

/**
 * Traduce el status de MP a nuestro sistema
 */
export function mapMPStatus(mpStatus: string): 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_PROCESS' | 'CANCELLED' | 'REFUNDED' {
  const map: Record<string, any> = {
    approved: 'APPROVED',
    rejected: 'REJECTED',
    pending: 'PENDING',
    in_process: 'IN_PROCESS',
    cancelled: 'CANCELLED',
    refunded: 'REFUNDED',
  }
  return map[mpStatus] || 'PENDING'
}
