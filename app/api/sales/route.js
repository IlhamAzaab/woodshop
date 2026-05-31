import { NextResponse } from 'next/server'
import { getSales, createSale } from '../../../lib/supabase'
import { getSessionProfile } from '../../../lib/auth-server'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const filterByUser = searchParams.get('my') === 'true'

    let userId = null
    if (filterByUser) {
      const { user } = await getSessionProfile()
      userId = user?.id || null
    }

    const sales = await getSales(userId)
    return NextResponse.json({ sales })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch sales.' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const { user } = await getSessionProfile()
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => null)
    const { product_id, quantity, sold_price } = body || {}

    if (!product_id || !quantity || !sold_price) {
      return NextResponse.json(
        { message: 'Product, quantity, and sold price are required.' },
        { status: 400 }
      )
    }

    await createSale({
      product_id,
      quantity: Number(quantity),
      sold_price: Number(sold_price),
      created_by: user.id,
    })

    return NextResponse.json(
      { message: 'Sale registered and sent to Manager for approval.' },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to register sale.' },
      { status: 500 }
    )
  }
}
