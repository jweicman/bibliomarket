export const dynamic = 'force-dynamic'

// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, avatar: true, phone: true, dni: true,
      street: true, streetNumber: true, apartment: true, city: true,
      province: true, postalCode: true, rating: true, totalRatings: true,
      isVerified: true, role: true, createdAt: true,
    },
  })

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const data = await req.json()
  const allowed = ['name', 'phone', 'dni', 'street', 'streetNumber', 'apartment', 'city', 'province', 'postalCode', 'avatar']
  const updateData: Record<string, any> = {}
  for (const key of allowed) {
    if (data[key] !== undefined) updateData[key] = data[key]
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, city: true, province: true },
  })

  return NextResponse.json({ user })
}
