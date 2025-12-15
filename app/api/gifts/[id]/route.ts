import { NextResponse, NextRequest } from "next/server"
import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"
import { all, getOne, run, init } from "@/lib/db"

export const runtime = "nodejs"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gifts")

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params
  let raw = idParam
  let id = parseInt(String(raw).replace(/[^0-9]/g, ''), 10)
  const contentType = request.headers.get("content-type") || ""
  await init()
  const current = await getOne<any>("SELECT * FROM gifts WHERE id = ?", [id])
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 })
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
    const next = { ...current, ...patch, id }
    if (Object.prototype.hasOwnProperty.call(patch, 'claimed') && patch.claimed === false) {
      next.claimedBy = null
      next.claimedByPhoto = null
    }
    await run(
      "UPDATE gifts SET name = ?, image = ?, category = COALESCE(category, NULL), claimed = ?, claimedBy = ?, claimedByPhoto = ? WHERE id = ?",
      [
        String(next.name || ""),
        next.image || null,
        next.claimed ? 1 : 0,
        next.claimedBy || null,
        next.claimedByPhoto || null,
        id,
      ]
    )
  } else {
    const body = await request.json()
    const next = { ...current, ...body, id }
    if (body && Object.prototype.hasOwnProperty.call(body, 'claimed') && body.claimed === false) {
      next.claimedBy = null
      next.claimedByPhoto = null
    }
    await run(
      "UPDATE gifts SET name = ?, image = ?, category = ?, claimed = ?, claimedBy = ?, claimedByPhoto = ? WHERE id = ?",
      [
        String(next.name || ""),
        next.image || null,
        next.category || null,
        next.claimed ? 1 : 0,
        next.claimedBy || null,
        next.claimedByPhoto || null,
        id,
      ]
    )
  }
  const updated = await getOne<any>("SELECT * FROM gifts WHERE id = ?", [id])
  const json = updated
    ? {
        id: Number(updated.id),
        name: String(updated.name || ""),
        image: updated.image ? String(updated.image) : "",
        category: updated.category ? String(updated.category) : undefined,
        claimed: Number(updated.claimed) === 1,
        claimedBy: updated.claimedBy ? String(updated.claimedBy) : undefined,
        claimedByPhoto: updated.claimedByPhoto ? String(updated.claimedByPhoto) : undefined,
      }
    : null
  return NextResponse.json(json)
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await context.params
  const id = Number(idParam)
  const current = await getOne<any>("SELECT * FROM gifts WHERE id = ?", [id])
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (Number(current.claimed) === 1) return NextResponse.json({ error: "claimed" }, { status: 409 })
  await run("DELETE FROM gifts WHERE id = ?", [id])
  return NextResponse.json({ ok: true })
}
