import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, sessionToken } from "@/lib/auth"

const USER_COOKIE = "uid"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/api/cron")) return NextResponse.next()

  // Optional site-wide password, for running a private copy.
  const password = process.env.APP_PASSWORD
  if (password && pathname !== "/login") {
    if (req.cookies.get(SESSION_COOKIE)?.value !== (await sessionToken(password))) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // No sign-up: first-time visitors set up a profile, which sets the uid cookie.
  if (pathname !== "/onboarding" && pathname !== "/login" && !req.cookies.get(USER_COOKIE)) {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
