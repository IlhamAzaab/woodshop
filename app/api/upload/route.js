import { NextResponse } from 'next/server'
import { getSessionProfile } from '../../../lib/auth-server'
import { uploadProductImage } from '../../../lib/supabase-storage'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const { profile } = await getSessionProfile()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only authenticated admins can upload product images.' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 })
    }

    const url = await uploadProductImage(file)

    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Upload failed.' },
      { status: 500 }
    )
  }
}
