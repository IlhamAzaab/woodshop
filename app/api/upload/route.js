import { NextResponse } from 'next/server'
import { uploadImageToCloudinary } from '../../../lib/cloudinary'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImageToCloudinary(buffer, file.name)

    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Upload failed.' },
      { status: 500 }
    )
  }
}
