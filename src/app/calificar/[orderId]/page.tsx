import { Suspense } from 'react'
import { ReviewClient } from '@/components/reviews/review-client'

export default function ReviewPage({ params }: { params: { orderId: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper-50" />}>
      <ReviewClient orderId={params.orderId} />
    </Suspense>
  )
}
