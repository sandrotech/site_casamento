import { NextResponse } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"
import { all, getOne, run, init } from "@/lib/db"

export const runtime = "nodejs"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "supporters")

export async function GET() {
  await init()
  const rows = await all<any>("SELECT id, name, photo, receipt, createdAt FROM supporters ORDER BY id")
  const items = rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name || ""),
    photo: r.photo ? String(r.photo) : undefined,
    receipt: r.receipt ? String(r.receipt) : undefined,
    createdAt: String(r.createdAt || ""),
  }))
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const ct = request.headers.get("content-type") || ""
  await init()
  const mx = await getOne<{ max: number }>("SELECT MAX(id) AS max FROM supporters")
  const nextId = ((mx?.max || 0) as number) + 1

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
    await run(
      "INSERT INTO supporters (id, name, photo, receipt, createdAt) VALUES (?, ?, ?, ?, ?)",
      [entry.id, entry.name, entry.photo || null, entry.receipt || null, entry.createdAt]
    )
    return NextResponse.json(entry, { status: 201 })
  }

  const body = await request.json().catch(() => ({}))
  const entry = { id: nextId, name: String(body?.name || ""), photo: body?.photo ? String(body.photo) : undefined, receipt: body?.receipt ? String(body.receipt) : undefined, createdAt: new Date().toISOString() }
  await run(
    "INSERT INTO supporters (id, name, photo, receipt, createdAt) VALUES (?, ?, ?, ?, ?)",
    [entry.id, entry.name, entry.photo || null, entry.receipt || null, entry.createdAt]
  )
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}))
  const id = Number(body?.id || 0)
  if (!id) return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  const current = await getOne<any>("SELECT id FROM supporters WHERE id = ?", [id])
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  await run("DELETE FROM supporters WHERE id = ?", [id])
  return NextResponse.json({ ok: true })
}
