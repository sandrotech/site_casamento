import { NextResponse, NextRequest } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params
  let raw = idParam
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
      const safeBase = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const raw = Buffer.from(await imageFile.arrayBuffer())
      try {
        const processed = await sharp(raw, { animated: true }).rotate().jpeg({ quality: 82 }).toBuffer()
        const filename = `${Date.now()}-${safeBase.replace(/\.[^.]+$/, "")}.jpg`
        await fs.writeFile(path.join(UPLOAD_DIR, filename), processed)
        patch.image = `/uploads/gifts/${filename}`
      } catch {
        const filename = `${Date.now()}-${safeBase}`
        await fs.writeFile(path.join(UPLOAD_DIR, filename), raw)
        patch.image = `/uploads/gifts/${filename}`
      }
    }
    const claimedByPhotoFile = form.get("claimedByPhoto") as File | null
    if (claimedByPhotoFile && typeof claimedByPhotoFile === "object" && claimedByPhotoFile.size) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
      const safeBase = claimedByPhotoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const raw = Buffer.from(await claimedByPhotoFile.arrayBuffer())
      try {
        const processed = await sharp(raw, { animated: true }).rotate().jpeg({ quality: 82 }).toBuffer()
        const filename = `${Date.now()}-${safeBase.replace(/\.[^.]+$/, "")}.jpg`
        await fs.writeFile(path.join(UPLOAD_DIR, filename), processed)
        patch.claimedByPhoto = `/uploads/gifts/${filename}`
      } catch {
        const filename = `${Date.now()}-${safeBase}`
        await fs.writeFile(path.join(UPLOAD_DIR, filename), raw)
        patch.claimedByPhoto = `/uploads/gifts/${filename}`
      }
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

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params
  const id = Number(idParam)
  const items = await readAll()
  const idx = items.findIndex((g: any) => Number(g.id) === id)
  if (idx === -1) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (items[idx]?.claimed) return NextResponse.json({ error: "claimed" }, { status: 409 })
  items.splice(idx, 1)
  await writeAll(items)
  return NextResponse.json({ ok: true })
}
