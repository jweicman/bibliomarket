export const dynamic = 'force-dynamic'

// src/app/api/shipping/oca-rate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getOCARate } from '@/lib/oca'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cpOrigen = searchParams.get('cpOrigen')
  const cpDestino = searchParams.get('cpDestino')
  const peso = parseFloat(searchParams.get('peso') || '1')

  if (!cpOrigen || !cpDestino) {
    return NextResponse.json({ error: 'Se requieren CP origen y destino' }, { status: 400 })
  }

  try {
    const rates = await getOCARate(cpOrigen, cpDestino, peso)
    return NextResponse.json({ rates })
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar tarifas OCA' }, { status: 500 })
  }
}
