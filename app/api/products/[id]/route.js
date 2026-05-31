import { NextResponse } from 'next/server'
import { getCatalogProductById } from '../../../../lib/supabase'

export async function GET(_req, { params }) {
  const product = await getCatalogProductById(params.id)

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product })
}
