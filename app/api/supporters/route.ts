import { NextResponse } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "data", "supporters.json")
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "supporters")

async function ensureFile() {
  try {
    await fs.access(DATA_PATH)
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
    await fs.writeFile(DATA_PATH, "[]", "utf-8")
  }
}

async function readAll() {
  await ensureFile()
  const buf = await fs.readFile(DATA_PATH, "utf-8")
  try {
    return JSON.parse(buf)
  } catch {
    return []
  }
}

async function writeAll(items: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8")
}

export async function GET() {
  const items = await readAll()
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") || ""
  const items = await readAll()
  const nextId = items.reduce((m: number, it: any) => Math.max(m, Number(it.id) || 0), 0) + 1

  async function saveFile(file: File, dir: string) {
    await fs.mkdir(dir, { recursive: true })
    const ct = (file.type || "").toLowerCase()
    const ab = await file.arrayBuffer()
    const buf = Buffer.from(ab)
    const base = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    let outName = `${Date.now()}-${base}`
    let outPath = path.join(dir, outName)
    try {
      const pipeline = sharp(buf, { animated: true }).rotate()
      const jpeg = await pipeline.jpeg({ quality: 82 }).toBuffer()
      outName = `${Date.now()}-${base.replace(/\.[^.]+$/, "")}.jpg`
      outPath = path.join(dir, outName)
      await fs.writeFile(outPath, jpeg)
    } catch {
      await fs.writeFile(outPath, buf)
    }
    return outName
  }

  if (ct.includes("multipart/form-data")) {
    const form = await request.formData()
    const name = String(form.get("supportName") || form.get("name") || "")
    const photoFile = (form.get("supportPhoto") || form.get("photo")) as File | null
    const receiptFile = (form.get("receipt") || form.get("comprovante")) as File | null
    let photoPath = ""
    let receiptPath = ""
    if (photoFile && typeof photoFile === "object" && photoFile.size) {
      const fname = await saveFile(photoFile, UPLOAD_DIR)
      photoPath = `/uploads/supporters/${fname}`
    }
    if (receiptFile && typeof receiptFile === "object" && receiptFile.size) {
      const fname = await saveFile(receiptFile, UPLOAD_DIR)
      receiptPath = `/uploads/supporters/${fname}`
    }
    const entry = { id: nextId, name, photo: photoPath || undefined, receipt: receiptPath || undefined, createdAt: new Date().toISOString() }
    items.push(entry)
    await writeAll(items)
    return NextResponse.json(entry, { status: 201 })
  }

  const body = await request.json().catch(() => ({}))
  const entry = { id: nextId, name: String(body?.name || ""), photo: body?.photo ? String(body.photo) : undefined, receipt: body?.receipt ? String(body.receipt) : undefined, createdAt: new Date().toISOString() }
  items.push(entry)
  await writeAll(items)
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}))
  const id = Number(body?.id || 0)
  if (!id) return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  const items = await readAll()
  const idx = items.findIndex((it: any) => Number(it.id) === id)
  if (idx === -1) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  items.splice(idx, 1)
  await writeAll(items)
  return NextResponse.json({ ok: true })
}
