import { NextResponse } from 'next/server'
import { approveProduct } from '../../../../../lib/supabase'

export async function POST(req, { params }) {
  const { id } = await params
  const body = await req.json().catch(() => null)

  if (!body?.selling_price || Number(body.selling_price) <= 0) {
    return NextResponse.json(
      { message: 'Selling price is required and must be greater than 0.' },
      { status: 400 }
    )
  }

  try {
    await approveProduct(id, body.selling_price, body.approved_by || null)
    return NextResponse.json({ message: 'Product approved successfully.' })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to approve product.' },
      { status: 500 }
    )
  }
}
