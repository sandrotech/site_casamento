import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

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
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filename = `${Date.now()}-${safeName}`
    const filePath = path.join(UPLOAD_DIR, filename)
    await fs.writeFile(filePath, buffer)
    return `/uploads/gifts/${filename}`
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const name = String(form.get("name") || "")
    const imageFile = form.get("image") as File | null
    let imagePath = ""
    if (imageFile && typeof imageFile === "object" && imageFile.size) {
      imagePath = await saveUploadedFile(imageFile)
    }
    const entry = {
      id: nextId,
      name,
      image: imagePath,
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
      claimed: Boolean(body?.claimed || false),
      claimedBy: body?.claimedBy ? String(body.claimedBy) : undefined,
      claimedByPhoto: body?.claimedByPhoto ? String(body.claimedByPhoto) : undefined,
    }
    data.push(entry)
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8")
    return NextResponse.json(entry, { status: 201 })
  }
}