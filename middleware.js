import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/admin/login',
  '/manager/login',
]

function isPublicRoute(pathname) {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/products/') ||
    pathname === '/favicon.ico'
  )
}

function getRoleLoginPath(role) {
  return role === 'manager' ? '/manager/login' : '/admin/login'
}

export async function middleware(req) {
  const pathname = req.nextUrl.pathname
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set({ name, value, ...options })
          )
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = pathname.startsWith('/admin')
  const isManagerRoute = pathname.startsWith('/manager')

  if (isPublicRoute(pathname)) {
    return response
  }

  if (!user) {
    const redirectUrl = new URL(
      isManagerRoute ? '/manager/login' : '/admin/login',
      req.url
    )
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (isAdminRoute && role !== 'admin') {
      const redirectUrl = new URL(getRoleLoginPath(role), req.url)
      return NextResponse.redirect(redirectUrl)
    }

    if (isManagerRoute && role !== 'manager') {
      const redirectUrl = new URL(getRoleLoginPath(role), req.url)
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname === '/admin/login' && role === 'admin') {
      const redirectUrl = new URL('/admin/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname === '/manager/login' && role === 'manager') {
      const redirectUrl = new URL('/manager/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
}
