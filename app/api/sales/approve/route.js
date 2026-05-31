import { NextResponse } from 'next/server'
import { approveSale, rejectSale } from '../../../../lib/supabase'
import { getSessionProfile } from '../../../../lib/auth-server'

export async function POST(req) {
  try {
    const { user, profile } = await getSessionProfile()
    if (!user || profile?.role !== 'manager') {
      return NextResponse.json(
        { message: 'Unauthorized. Only managers can approve sales.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => null)
    const { id, action } = body || {}

    if (!id || !action) {
      return NextResponse.json(
        { message: 'Sale transaction ID and action are required.' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      await approveSale(id, user.id)
      return NextResponse.json({ message: 'Sale approved and stock reduced.' })
    } else if (action === 'reject') {
      await rejectSale(id)
      return NextResponse.json({ message: 'Sale rejected.' })
    } else {
      return NextResponse.json(
        { message: 'Invalid action. Must be approve or reject.' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to process sale action.' },
      { status: 500 }
    )
  }
}
