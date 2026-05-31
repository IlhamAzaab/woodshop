import { NextResponse } from 'next/server'
import { getAdmins, createAdminUser, deleteAdminUser } from '../../../lib/supabase'

export async function GET() {
  try {
    const users = await getAdmins()
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch admin accounts.' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null)
    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      )
    }

    await createAdminUser(body.email, body.password)
    return NextResponse.json(
      { message: 'Admin account created successfully.' },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to create admin account.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Admin ID is required.' },
        { status: 400 }
      )
    }

    await deleteAdminUser(id)
    return NextResponse.json(
      { message: 'Admin account deleted successfully.' }
    )
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to delete admin account.' },
      { status: 500 }
    )
  }
}
