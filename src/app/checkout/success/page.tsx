import { Suspense } from 'react'
import { CheckoutSuccessClient } from '@/components/checkout/checkout-success-client'

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutSuccessClient />
    </Suspense>
  )
}
