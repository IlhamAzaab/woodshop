import { NextResponse } from 'next/server'
import { getServiceRoleClient } from '../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const supabase = getServiceRoleClient()
    
    let query = supabase
      .from('sales')
      .select(`
        *,
        product:products(name, image_urls, category:categories(name)),
        size:product_sizes(size, stock)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: sales, error } = await query

    if (error) throw error

    return NextResponse.json({ sales })
  } catch (err) {
    console.error('Failed to fetch sales:', err)
    return NextResponse.json({ error: 'Failed to fetch sales', details: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { product_id, size_id, quantity, price } = await request.json()

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }

    const supabase = getServiceRoleClient()

    const { error } = await supabase
      .from('sales')
      .insert({
        product_id,
        size_id,
        quantity,
        admin_price: price,
        final_price: price,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sale log error:', err)
    return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 })
  }
}
