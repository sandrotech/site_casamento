import { NextResponse } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"
import { all, getOne, run, init } from "@/lib/db"

export const runtime = "nodejs"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gifts")

export async function GET() {
  await init()
  const rows = await all<any>(
    "SELECT id, name, image, category, claimed, claimedBy, claimedByPhoto FROM gifts ORDER BY id"
  )
  const data = rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name || ""),
    image: r.image ? String(r.image) : "",
    category: r.category ? String(r.category) : undefined,
    claimed: Number(r.claimed) === 1,
    claimedBy: r.claimedBy ? String(r.claimedBy) : undefined,
    claimedByPhoto: r.claimedByPhoto ? String(r.claimedByPhoto) : undefined,
  }))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  await init()
  const mx = await getOne<{ max: number }>("SELECT MAX(id) as max FROM gifts")
  const nextId = ((mx?.max || 0) as number) + 1

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
    await run(
      "INSERT INTO gifts (id, name, image, category, claimed) VALUES (?, ?, ?, ?, ?)",
      [entry.id, entry.name, entry.image || null, entry.category || null, entry.claimed ? 1 : 0]
    )
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
    await run(
      "INSERT INTO gifts (id, name, image, category, claimed, claimedBy, claimedByPhoto) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        entry.id,
        entry.name,
        entry.image || null,
        entry.category || null,
        entry.claimed ? 1 : 0,
        entry.claimedBy || null,
        entry.claimedByPhoto || null,
      ]
    )
    return NextResponse.json(entry, { status: 201 })
  }
}
