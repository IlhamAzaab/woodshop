import { NextResponse } from 'next/server'
import { createContactLead } from '../../../lib/supabase'

export async function POST(req) {
  const body = await req.json().catch(() => null)

  if (!body?.name || !body?.email || !body?.message) {
    return NextResponse.json(
      { message: 'Name, email, and message are required.' },
      { status: 400 }
    )
  }

  try {
    const result = await createContactLead(body)
    return NextResponse.json({ message: 'Message sent successfully.', result })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Unable to send message.' },
      { status: 500 }
    )
  }
}
