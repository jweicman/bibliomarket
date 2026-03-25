export const dynamic = 'force-dynamic'

// src/app/dashboard/ventas/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SalesClient } from '@/components/dashboard/sales-client'

export const metadata = { title: 'Mis ventas' }

export default async function SalesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    include: {
      book: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
      buyer: { select: { id: true, name: true, avatar: true, email: true, phone: true, city: true, province: true, postalCode: true } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalEarned = orders
    .filter(o => o.paymentStatus === 'APPROVED')
    .reduce((sum, o) => sum + (o.total - o.platformFee), 0)

  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-5xl">
        <SalesClient orders={orders as any} totalEarned={totalEarned} />
      </main>
      <Footer />
    </>
  )
}
