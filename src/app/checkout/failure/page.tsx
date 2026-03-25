import { Suspense } from 'react'
import { CheckoutFailureClient } from '@/components/checkout/checkout-failure-client'

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper-50" />}>
      <CheckoutFailureClient />
    </Suspense>
  )
}
