import { NextResponse } from 'next/server'
import { updateProductStock } from '../../../../lib/supabase'

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null)
    const { id, stock } = body || {}

    if (!id || stock === undefined || stock === null) {
      return NextResponse.json(
        { message: 'Product ID and stock count are required.' },
        { status: 400 }
      )
    }

    await updateProductStock(id, Number(stock))
    return NextResponse.json({ message: 'Stock updated successfully.' })
  } catch (error) {
    console.error('[STOCK UPDATE ERROR]', error?.message || error)
    return NextResponse.json(
      { message: error.message || 'Failed to update stock.' },
      { status: 500 }
    )
  }
}
