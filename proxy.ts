import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/verify/') ||
    pathname.startsWith('/api/certificates/verify/')
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  })

  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (pathname === '/api/my-certificates') {
      return NextResponse.next()
    }

    if (!isAdminEmail(token.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!isAdminEmail(token.email)) {
    return NextResponse.redirect(new URL('/my-certificates', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
