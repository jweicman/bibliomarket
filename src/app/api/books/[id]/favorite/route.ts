export const dynamic = 'force-dynamic'

// src/app/api/books/[id]/favorite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.favorite.create({
      data: { userId: session.user.id, bookId: params.id },
    })
    return NextResponse.json({ favorited: true })
  } catch {
    return NextResponse.json({ error: 'Ya es favorito' }, { status: 409 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, bookId: params.id },
  })
  return NextResponse.json({ favorited: false })
}
