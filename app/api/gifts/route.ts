import { NextResponse } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const DATA_PATH = path.join(process.cwd(), "data", "gifts.json")
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gifts")

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
  const contentType = request.headers.get("content-type") || ""
  const buf = await fs.readFile(DATA_PATH, "utf-8")
  const data = JSON.parse(buf)
  const nextId = data.reduce((max: number, g: any) => Math.max(max, Number(g.id) || 0), 0) + 1

  async function saveUploadedFile(file: File) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const base = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const raw = Buffer.from(await file.arrayBuffer())
    try {
      const processed = await sharp(raw, { animated: true }).rotate().jpeg({ quality: 82 }).toBuffer()
      const name = `${Date.now()}-${base.replace(/\.[^.]+$/, "")}.jpg`
      await fs.writeFile(path.join(UPLOAD_DIR, name), processed)
      return `/uploads/gifts/${name}`
    } catch {
      const name = `${Date.now()}-${base}`
      await fs.writeFile(path.join(UPLOAD_DIR, name), raw)
      return `/uploads/gifts/${name}`
    }
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const name = String(form.get("name") || "")
    const category = String(form.get("category") || "")
    const imageFile = form.get("image") as File | null
    let imagePath = ""
    if (imageFile && typeof imageFile === "object" && imageFile.size) {
      imagePath = await saveUploadedFile(imageFile)
    }
    const entry = {
      id: nextId,
      name,
      image: imagePath,
      category,
      claimed: false,
    }
    data.push(entry)
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8")
    return NextResponse.json(entry, { status: 201 })
  } else {
    const body = await request.json()
    const entry = {
      id: nextId,
      name: String(body?.name || ""),
      image: String(body?.image || ""),
      category: String(body?.category || ""),
      claimed: Boolean(body?.claimed || false),
      claimedBy: body?.claimedBy ? String(body.claimedBy) : undefined,
      claimedByPhoto: body?.claimedByPhoto ? String(body.claimedByPhoto) : undefined,
    }
    data.push(entry)
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8")
    return NextResponse.json(entry, { status: 201 })
  }
}
