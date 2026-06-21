import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

const protectedRoutes = ['/account', '/home']
const devHosts = new Set(['dev.mypaperpop.com'])

function isDevHost(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase()
  return !!host && devHosts.has(host)
}

function addDevNoIndexHeaders(response: Response, request: NextRequest) {
  if (!isDevHost(request)) return response
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  return response
}

// Session-aware middleware for protected routes
const withAuth = auth((request) => {
  const isAuthenticated = !!request.auth
  const { pathname } = request.nextUrl

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/#sign-in', request.url))
  }

  return NextResponse.next()
})

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (isDevHost(request) && pathname === '/robots.txt') {
    return new NextResponse('User-agent: *\nDisallow: /\n', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    })
  }

  // Capture referral cookie OUTSIDE the auth() wrapper.
  // NextAuth beta's handleAuth() reconstructs the Response via
  // `new Response(body, res)` which can drop Set-Cookie headers
  // set inside the auth callback.
  const refCode = searchParams.get('ref')
  if (pathname === '/' && refCode && /^[A-Za-z0-9]{6}$/.test(refCode)) {
    const response = NextResponse.next()
    response.cookies.set('pending_referral', refCode.toUpperCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    })
    return addDevNoIndexHeaders(response, request)
  }

  if (!protectedRoutes.some((r) => pathname.startsWith(r))) {
    return addDevNoIndexHeaders(NextResponse.next(), request)
  }

  // Delegate to NextAuth for session validation + protected route redirects.
  // Type assertion needed: auth() beta types don't cleanly express the
  // middleware-wrapper overload, but runtime accepts NextRequest fine.
  const response = await (withAuth as (req: NextRequest) => Promise<Response>)(request)
  return addDevNoIndexHeaders(response, request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|stubs|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)',
  ],
}
