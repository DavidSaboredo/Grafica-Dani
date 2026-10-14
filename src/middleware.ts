import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, SESSION_COOKIE_PATH, verifySessionToken } from './lib/auth'

const LOGIN_PATH = '/admin/ingresar'

// Protege todo /admin: sin sesión válida (firma HMAC y vencimiento) va al ingreso
export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  const isAuthenticated = await verifySessionToken(sessionToken)
  // next.config usa trailingSlash: true ("/admin/ingresar/")
  const pathname = request.nextUrl.pathname.replace(/\/+$/, '') || '/'

  let response: NextResponse
  if (pathname === LOGIN_PATH) {
    response = isAuthenticated
      ? NextResponse.redirect(new URL('/admin/', request.url))
      : NextResponse.next()
  } else if (!isAuthenticated) {
    response = NextResponse.redirect(new URL(`${LOGIN_PATH}/`, request.url))
    // Borrar cookies viejas o adulteradas (firma inválida o vencida)
    if (sessionToken) response.cookies.delete({ name: SESSION_COOKIE, path: SESSION_COOKIE_PATH })
  } else {
    response = NextResponse.next()
  }

  // El panel no tiene que aparecer en Google
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
