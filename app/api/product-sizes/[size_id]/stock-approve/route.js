import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '../../../../../lib/supabase'

export async function POST(request, { params }) {
  try {
    const { size_id } = await params
    const { final_addition } = await request.json()

    if (final_addition === undefined || final_addition <= 0) {
      return NextResponse.json({ error: 'Valid addition quantity is required' }, { status: 400 })
    }

    const supabase = getServiceRoleClient()

    // 1. Get current stock
    const { data: size, error: sizeErr } = await supabase
      .from('product_sizes')
      .select('stock')
      .eq('id', size_id)
      .single()

    if (sizeErr) throw sizeErr

    const newStock = size.stock + final_addition
    
    // 2. Update stock and reset stock_request
    const { error: stockErr } = await supabase
      .from('product_sizes')
      .update({ stock: newStock, stock_request: 0 })
      .eq('id', size_id)

    if (stockErr) throw stockErr

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Approve stock error:', err)
    return NextResponse.json({ error: 'Failed to approve stock addition' }, { status: 500 })
  }
}
