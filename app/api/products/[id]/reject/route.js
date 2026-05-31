import { NextResponse } from 'next/server'
import { rejectProduct } from '../../../../../lib/supabase'

export async function POST(req, { params }) {
  const { id } = await params

  try {
    await rejectProduct(id)
    return NextResponse.json({ message: 'Product rejected.' })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to reject product.' },
      { status: 500 }
    )
  }
}
