import { NextResponse } from "next/server"
import { all, run, init } from "@/lib/db"

export async function GET() {
  await init()
  const rows = await all<any>("SELECT name, guests, message, createdAt FROM rsvps ORDER BY createdAt")
  const data = rows.map((r) => ({
    name: String(r.name || ""),
    guests: Number(r.guests || 0),
    message: r.message ? String(r.message) : "",
    createdAt: String(r.createdAt || ""),
  }))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const entry = {
    name: String(body?.name || ""),
    guests: Number(body?.guests || 0),
    message: String(body?.message || ""),
    createdAt: new Date().toISOString(),
  }
  await init()
  await run("INSERT INTO rsvps (name, guests, message, createdAt) VALUES (?, ?, ?, ?)", [
    entry.name,
    entry.guests,
    entry.message || null,
    entry.createdAt,
  ])
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  const key = String(body?.createdAt || "")
  await init()
  await run("DELETE FROM rsvps WHERE createdAt = ?", [key])
  return NextResponse.json({ ok: true })
}
