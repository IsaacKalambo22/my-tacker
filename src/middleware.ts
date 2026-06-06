import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  // Role-based checks will be handled by server components and API routes
  // Middleware only ensures basic authentication via session cookies
  if (pathname.startsWith("/dashboard")) {
    const sessionToken = request.cookies.get("next-auth.session-token") || 
                         request.cookies.get("__Secure-next-auth.session-token")
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that handle their own auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
