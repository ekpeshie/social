import "server-only"
import { promises as fs } from "fs"
import path from "path"
import { Redis } from "@upstash/redis"
import { defaultProfile } from "./defaults"
import type { Batch, Profile } from "./types"

// Upstash Redis when its env vars are set (production on Vercel);
// otherwise a JSON file in .data/ for local development.
type KV = {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
}

function redisKV(): KV | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const redis = new Redis({ url, token })
  return {
    get: (key) => redis.get(key),
    set: async (key, value) => {
      await redis.set(key, value)
    },
  }
}

function fileKV(): KV {
  const file = path.join(process.cwd(), ".data", "db.json")
  const read = async (): Promise<Record<string, unknown>> => {
    try {
      return JSON.parse(await fs.readFile(file, "utf8"))
    } catch {
      return {}
    }
  }
  return {
    get: async <T,>(key: string) => ((await read())[key] as T) ?? null,
    set: async (key, value) => {
      const db = await read()
      db[key] = value
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, JSON.stringify(db, null, 2))
    },
  }
}

const kv: KV = redisKV() ?? fileKV()

// Every record is stored per user: u:<id>:profile, u:<id>:batch:<date>, u:<id>:batch-dates.
const k = (uid: string, key: string) => `u:${uid}:${key}`

export async function listUsers(): Promise<string[]> {
  return (await kv.get<string[]>("users")) ?? []
}

export async function getProfile(uid: string): Promise<Profile> {
  const saved = await kv.get<Partial<Profile>>(k(uid, "profile"))
  return { ...defaultProfile, ...(saved ?? {}) }
}

export async function hasProfile(uid: string): Promise<boolean> {
  return (await kv.get(k(uid, "profile"))) !== null
}

export async function saveProfile(uid: string, profile: Profile) {
  await kv.set(k(uid, "profile"), profile)
  const users = await listUsers()
  if (!users.includes(uid)) await kv.set("users", [...users, uid])
}

export async function getBatch(uid: string, date: string): Promise<Batch | null> {
  return kv.get<Batch>(k(uid, `batch:${date}`))
}

export async function saveBatch(uid: string, batch: Batch) {
  await kv.set(k(uid, `batch:${batch.date}`), batch)
  const dates = await listBatchDates(uid)
  if (!dates.includes(batch.date)) {
    await kv.set(k(uid, "batch-dates"), [batch.date, ...dates].sort().reverse())
  }
}

export async function listBatchDates(uid: string): Promise<string[]> {
  return (await kv.get<string[]>(k(uid, "batch-dates"))) ?? []
}

export async function recentBatches(uid: string, limit: number): Promise<Batch[]> {
  const dates = (await listBatchDates(uid)).slice(0, limit)
  const batches = await Promise.all(dates.map((d) => getBatch(uid, d)))
  return batches.filter((b): b is Batch => b !== null)
}
