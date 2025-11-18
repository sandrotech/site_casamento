import { NextResponse } from "next/server"

export function middleware(req: any) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/painel/")) {
    const cookie = req.cookies.get("admin_auth")
    if (!cookie || cookie.value !== "ok") {
      const url = req.nextUrl.clone()
      url.pathname = "/access/familia-santos"
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/painel/:path*"],
}