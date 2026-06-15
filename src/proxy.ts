import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/unauthorized"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard")) {
    // NextAuth v5 (Auth.js) uses "authjs.session-token" for JWT sessions.
    // In production (HTTPS) it is prefixed with "__Secure-".
    const sessionToken =
      request.cookies.get("authjs.session-token") ??
      request.cookies.get("__Secure-authjs.session-token")

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}
