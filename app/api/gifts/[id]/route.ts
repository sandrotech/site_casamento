import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "data", "gifts.json")
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gifts")

async function readAll() {
  try {
    const buf = await fs.readFile(DATA_PATH, "utf-8")
    return JSON.parse(buf)
  } catch {
    return []
  }
}

async function writeAll(items: any[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8")
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  let raw = params?.id
  if (!raw) {
    try {
      const url = new URL(request.url)
      raw = url.pathname.split('/').filter(Boolean).pop() || ''
    } catch {}
  }
  let id = parseInt(String(raw).replace(/[^0-9]/g, ''), 10)
  const contentType = request.headers.get("content-type") || ""
  const items = await readAll()
  const idx = items.findIndex((g: any) => Number(g.id) === id)
  if (idx === -1) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const patch: any = {}
    if (form.has("name")) patch.name = String(form.get("name") || "")
    if (form.has("claimed")) patch.claimed = String(form.get("claimed")) === "true"
    if (form.has("claimedBy")) patch.claimedBy = String(form.get("claimedBy") || "")
    const imageFile = form.get("image") as File | null
    if (imageFile && typeof imageFile === "object" && imageFile.size) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const filename = `${Date.now()}-${safeName}`
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer)
      patch.image = `/uploads/gifts/${filename}`
    }
    const claimedByPhotoFile = form.get("claimedByPhoto") as File | null
    if (claimedByPhotoFile && typeof claimedByPhotoFile === "object" && claimedByPhotoFile.size) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
      const safeName = claimedByPhotoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const filename = `${Date.now()}-${safeName}`
      const arrayBuffer = await claimedByPhotoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer)
      patch.claimedByPhoto = `/uploads/gifts/${filename}`
    }
    items[idx] = { ...items[idx], ...patch, id }
  } else {
    const body = await request.json()
    const next = { ...items[idx], ...body, id }
    if (body && Object.prototype.hasOwnProperty.call(body, 'claimed') && body.claimed === false) {
      delete next.claimedBy
      delete next.claimedByPhoto
    }
    items[idx] = next
  }
  await writeAll(items)
  return NextResponse.json(items[idx])
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const items = await readAll()
  const idx = items.findIndex((g: any) => Number(g.id) === id)
  if (idx === -1) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (items[idx]?.claimed) return NextResponse.json({ error: "claimed" }, { status: 409 })
  items.splice(idx, 1)
  await writeAll(items)
  return NextResponse.json({ ok: true })
}
