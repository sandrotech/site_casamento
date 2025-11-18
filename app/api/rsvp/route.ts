import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "data", "rsvps.json")

async function ensureFile() {
  try {
    await fs.access(DATA_PATH)
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
    await fs.writeFile(DATA_PATH, "[]", "utf-8")
  }
}

export async function GET() {
  await ensureFile()
  const buf = await fs.readFile(DATA_PATH, "utf-8")
  const data = JSON.parse(buf)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  await ensureFile()
  const body = await request.json()
  const entry = {
    name: String(body?.name || ""),
    guests: Number(body?.guests || 0),
    message: String(body?.message || ""),
    createdAt: new Date().toISOString(),
  }
  const buf = await fs.readFile(DATA_PATH, "utf-8")
  const data = JSON.parse(buf)
  data.push(entry)
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8")
  return NextResponse.json(entry, { status: 201 })
}