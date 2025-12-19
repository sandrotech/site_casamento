import path from "path"
import { promises as fs } from "fs"

const DB_PATH = path.join(process.cwd(), "data", "site.db")
let db: any | null = null
let initialized = false

async function open(): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const mod = await import("sqlite3")
      const sqlite3 = (mod as any).default || mod
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
      const instance = new sqlite3.Database(DB_PATH, (err: any) => {
        if (err) reject(err)
        else resolve(instance)
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function getDb(): Promise<any> {
  if (db) return db
  db = await open()
  return db
}

function run(sql: string, params: any[] = []): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const conn = await getDb()
    conn.run(sql, params, function (err: any) {
      if (err) reject(err)
      else resolve()
    })
  })
}

function getOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const conn = await getDb()
    conn.get(sql, params, function (err: any, row: any) {
      if (err) reject(err)
      else resolve(row as T | undefined)
    })
  })
}

function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const conn = await getDb()
    conn.all(sql, params, function (err: any, rows: any[]) {
      if (err) reject(err)
      else resolve(rows as T[])
    })
  })
}

async function init(): Promise<void> {
  if (initialized) return
  await run("PRAGMA journal_mode = WAL")
  await run(
    "CREATE TABLE IF NOT EXISTS gifts (id INTEGER PRIMARY KEY, name TEXT NOT NULL, image TEXT, category TEXT, claimed INTEGER NOT NULL DEFAULT 0, claimedBy TEXT, claimedByPhoto TEXT)"
  )
  await run(
    "CREATE TABLE IF NOT EXISTS rsvps (id INTEGER PRIMARY KEY, name TEXT NOT NULL, guests INTEGER NOT NULL, message TEXT, createdAt TEXT NOT NULL)"
  )
  await run(
    "CREATE TABLE IF NOT EXISTS supporters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, photo TEXT, receipt TEXT, createdAt TEXT NOT NULL)"
  )
  initialized = true
}

async function migrateFromJsonIfNeeded(): Promise<void> {
  await init()
  const row = await getOne<{ c: number }>("SELECT COUNT(*) AS c FROM gifts")
  if (row && row.c > 0) return
  try {
    const jsonPath = path.join(process.cwd(), "data", "gifts.json")
    const buf = await fs.readFile(jsonPath, "utf-8")
    const items = JSON.parse(buf)
    if (Array.isArray(items)) {
      for (const it of items) {
        await run(
          "INSERT OR REPLACE INTO gifts (id, name, image, category, claimed, claimedBy, claimedByPhoto) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            Number(it.id) || null,
            String(it.name || ""),
            it.image ? String(it.image) : null,
            it.category ? String(it.category) : null,
            it.claimed ? 1 : 0,
            it.claimedBy ? String(it.claimedBy) : null,
            it.claimedByPhoto ? String(it.claimedByPhoto) : null,
          ]
        )
      }
    }
  } catch { }
}

async function migrateRsvpsFromJsonIfNeeded(): Promise<void> {
  await init()
  const row = await getOne<{ c: number }>("SELECT COUNT(*) AS c FROM rsvps")
  if (row && row.c > 0) return
  try {
    const jsonPath = path.join(process.cwd(), "data", "rsvps.json")
    const buf = await fs.readFile(jsonPath, "utf-8")
    const items = JSON.parse(buf)
    if (Array.isArray(items)) {
      for (const it of items) {
        await run(
          "INSERT INTO rsvps (name, guests, message, createdAt) VALUES (?, ?, ?, ?)",
          [
            String(it.name || ""),
            Number(it.guests || 0),
            it.message ? String(it.message) : null,
            String(it.createdAt || new Date().toISOString()),
          ]
        )
      }
    }
  } catch { }
}

async function migrateSupportersFromJsonIfNeeded(): Promise<void> {
  await init()
  const row = await getOne<{ c: number }>("SELECT COUNT(*) AS c FROM supporters")
  if (row && row.c > 0) return
  try {
    const jsonPath = path.join(process.cwd(), "data", "supporters.json")
    const buf = await fs.readFile(jsonPath, "utf-8")
    const items = JSON.parse(buf)
    if (Array.isArray(items)) {
      for (const it of items) {
        await run(
          "INSERT OR REPLACE INTO supporters (id, name, photo, receipt, createdAt) VALUES (?, ?, ?, ?, ?)",
          [
            Number(it.id) || null,
            String(it.name || ""),
            it.photo ? String(it.photo) : null,
            it.receipt ? String(it.receipt) : null,
            String(it.createdAt || new Date().toISOString()),
          ]
        )
      }
    }
  } catch { }
}

export { getDb, run, getOne, all, init, migrateFromJsonIfNeeded, migrateRsvpsFromJsonIfNeeded, migrateSupportersFromJsonIfNeeded }

