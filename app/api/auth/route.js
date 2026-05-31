import { NextResponse } from 'next/server'
import { getSessionProfile } from '../../../lib/auth-server'

export async function GET() {
  const { user, profile } = await getSessionProfile()

  return NextResponse.json({
    authenticated: Boolean(user),
    user: user
      ? {
          id: user.id,
          email: user.email,
        }
      : null,
    profile,
  })
}

