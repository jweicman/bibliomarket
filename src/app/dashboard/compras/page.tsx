// src/app/dashboard/compras/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PurchasesClient } from '@/components/dashboard/purchases-client'

export const metadata = { title: 'Mis compras' }

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      book: {
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          category: true,
        },
      },
      seller: { select: { id: true, name: true, avatar: true, rating: true } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Navbar />
      <main className="container-main py-8 max-w-4xl">
        <PurchasesClient orders={orders as any} />
      </main>
      <Footer />
    </>
  )
}
