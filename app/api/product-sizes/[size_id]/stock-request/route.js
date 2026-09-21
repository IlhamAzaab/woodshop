import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '../../../../../lib/supabase'

export async function POST(request, { params }) {
  try {
    const { size_id } = await params
    const { quantity } = await request.json()

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 })
    }

    const supabase = getServiceRoleClient()

    // We only update stock_request
    const { error } = await supabase
      .from('product_sizes')
      .update({ stock_request: quantity })
      .eq('id', size_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Stock request error:', err)
    return NextResponse.json({ error: 'Failed to request stock addition' }, { status: 500 })
  }
}
