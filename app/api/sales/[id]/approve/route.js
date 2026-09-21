import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '../../../../../lib/supabase'

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { final_price } = await request.json()

    if (final_price === undefined || final_price <= 0) {
      return NextResponse.json({ error: 'Valid final price is required' }, { status: 400 })
    }

    const supabase = getServiceRoleClient()

    // 1. Get the sale
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single()

    if (saleErr || !sale) throw saleErr || new Error('Sale not found')
    if (sale.status !== 'pending') {
      return NextResponse.json({ error: 'Sale is not pending' }, { status: 400 })
    }

    // 2. Decrement stock
    const { data: size, error: sizeErr } = await supabase
      .from('product_sizes')
      .select('stock')
      .eq('id', sale.size_id)
      .single()

    if (sizeErr) throw sizeErr

    const newStock = Math.max(0, size.stock - sale.quantity)
    
    const { error: stockErr } = await supabase
      .from('product_sizes')
      .update({ stock: newStock })
      .eq('id', sale.size_id)

    if (stockErr) throw stockErr

    // 3. Update sale status and final price
    const { error: updateErr } = await supabase
      .from('sales')
      .update({ status: 'approved', final_price })
      .eq('id', id)

    if (updateErr) throw updateErr

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Approve sale error:', err)
    return NextResponse.json({ error: 'Failed to approve sale' }, { status: 500 })
  }
}
