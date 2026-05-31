import { NextResponse } from 'next/server'
import { getApprovedProducts, getAllProducts, createProduct } from '../../../lib/supabase'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all')

  if (all === 'true') {
    const products = await getAllProducts()
    return NextResponse.json({ products })
  }

  const products = await getApprovedProducts()
  return NextResponse.json({ products })
}

export async function POST(req) {
  const body = await req.json().catch(() => null)

  if (!body?.name || !body?.category) {
    return NextResponse.json(
      { message: 'Product name and category are required.' },
      { status: 400 }
    )
  }

  try {
    await createProduct(body)
    return NextResponse.json(
      { message: 'Product created and sent for approval.' },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create product.' },
      { status: 500 }
    )
  }
}
