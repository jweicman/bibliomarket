// src/app/page.tsx
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { RecentBooks } from '@/components/home/recent-books'
import { HowItWorks } from '@/components/home/how-it-works'
import { TrustBanner } from '@/components/home/trust-banner'
import { FeaturedPacks } from '@/components/home/featured-packs'
import { prisma } from '@/lib/prisma'

async function getHomeData() {
  const [recentBooks, categories, stats] = await Promise.all([
    prisma.book.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        seller: { select: { id: true, name: true, avatar: true, rating: true, city: true, province: true } },
        category: true,
        _count: { select: { favorites: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    }),
    prisma.category.findMany({
      include: { _count: { select: { books: { where: { status: 'ACTIVE' } } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.$transaction([
      prisma.book.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
    ]),
  ])

  return { recentBooks, categories, stats }
}

export default async function HomePage() {
  const { recentBooks, categories, stats } = await getHomeData()

  return (
    <>
      <Navbar />
      <main>
        <Hero stats={stats} />
        <CategoryGrid categories={categories} />
        <Suspense fallback={<div className="h-96 animate-pulse bg-paper-100" />}>
          <RecentBooks books={recentBooks} />
        </Suspense>
        <HowItWorks />
        <FeaturedPacks />
        <TrustBanner />
      </main>
      <Footer />
    </>
  )
}
