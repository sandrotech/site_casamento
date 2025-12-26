import { NextResponse } from "next/server"

const PASSWORD = (process.env.ADMIN_PASSWORD || "familia_santos").toLowerCase().trim()

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  let pwd = ""
  if (contentType.includes("application/json")) {
    const body = await request.json()
    pwd = String(body?.password || "")
  } else if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    pwd = String(form.get("password") || "")
  }
  if (pwd.trim().toLowerCase() === PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set("admin_auth", "ok", { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 })
    return res
  }
  return NextResponse.json({ error: "unauthorized" }, { status: 401 })
}