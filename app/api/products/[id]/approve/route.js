import { NextResponse } from 'next/server'
import { approveProduct } from '../../../../../lib/supabase'

export async function POST(req, { params }) {
  const { id } = await params
  const body = await req.json().catch(() => null)

  if (!body?.size_prices || !Array.isArray(body.size_prices) || body.size_prices.length === 0) {
    return NextResponse.json(
      { message: 'Size prices are required. Each size must have a final_price.' },
      { status: 400 }
    )
  }

  // Validate all size prices are positive
  const invalidPrice = body.size_prices.find(
    (sp) => !sp.id || sp.final_price === undefined || Number(sp.final_price) <= 0
  )
  if (invalidPrice) {
    return NextResponse.json(
      { message: 'All size variants must have a valid final price greater than 0.' },
      { status: 400 }
    )
  }

  try {
    await approveProduct(id, body.size_prices, body.approved_by || null)
    return NextResponse.json({ message: 'Product approved successfully.' })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to approve product.' },
      { status: 500 }
    )
  }
}
