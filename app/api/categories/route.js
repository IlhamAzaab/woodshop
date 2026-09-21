import { NextResponse } from 'next/server'
import { getCategories, createCategory } from '../../../lib/supabase'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch categories.' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => null)

  if (!body?.name || !body.name.trim()) {
    return NextResponse.json(
      { message: 'Category name is required.' },
      { status: 400 }
    )
  }

  try {
    const category = await createCategory(body.name.trim())
    return NextResponse.json(
      { message: 'Category created successfully.', category },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create category.' },
      { status: 500 }
    )
  }
}
