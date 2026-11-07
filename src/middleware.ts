import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, sessionToken } from "@/lib/auth"

export async function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD
  // No password set: open access (fine for local dev only).
  if (!password) return NextResponse.next()

  const { pathname } = req.nextUrl
  if (pathname === "/login" || pathname.startsWith("/api/cron")) return NextResponse.next()

  if (req.cookies.get(SESSION_COOKIE)?.value === (await sessionToken(password))) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = "/login"
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
