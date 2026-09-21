import { NextResponse } from 'next/server'
import { getProductById, deleteProduct, getServiceRoleClient } from '../../../../lib/supabase'

export async function DELETE(_req, { params }) {
  const { id } = await params
  try {
    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function GET(_req, { params }) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({ product })
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const updates = await request.json()
    const supabase = getServiceRoleClient()

    // Update main product details
    if (updates.name !== undefined || updates.description !== undefined) {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
        })
        .eq('id', id)
      if (error) throw error
    }

    // Update sizes if provided
    if (updates.sizes && Array.isArray(updates.sizes)) {
      for (const size of updates.sizes) {
        const { error } = await supabase
          .from('product_sizes')
          .update({
            final_price: size.final_price,
            stock: size.stock,
          })
          .eq('id', size.id)
        if (error) throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
