import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

const PUBLIC_DIR = path.join(process.cwd(), "public")
const IMG_RE = /\.(png|jpe?g|gif|webp|svg)$/i

async function walk(dir: string): Promise<string[]> {
  let list: string[] = []
  let entries: any[] = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return list
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      // skip node_modules or hidden directories just in case
      if (ent.name.startsWith(".")) continue
      list = list.concat(await walk(full))
    } else {
      if (IMG_RE.test(ent.name)) {
        const rel = path
          .relative(PUBLIC_DIR, full)
          .split(path.sep)
          .join("/")
        list.push("/" + rel)
      }
    }
  }
  return list
}

export async function GET() {
  try {
    const imgs = await walk(PUBLIC_DIR)
    return NextResponse.json(imgs)
  } catch {
    return NextResponse.json([])
  }
}

