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

export async function getProfile(): Promise<Profile> {
  const saved = await kv.get<Partial<Profile>>("profile")
  return { ...defaultProfile, ...(saved ?? {}) }
}

export async function saveProfile(profile: Profile) {
  await kv.set("profile", profile)
}

export async function getBatch(date: string): Promise<Batch | null> {
  return kv.get<Batch>(`batch:${date}`)
}

export async function saveBatch(batch: Batch) {
  await kv.set(`batch:${batch.date}`, batch)
  const dates = (await kv.get<string[]>("batch-dates")) ?? []
  if (!dates.includes(batch.date)) {
    await kv.set("batch-dates", [batch.date, ...dates].sort().reverse())
  }
}

export async function listBatchDates(): Promise<string[]> {
  return (await kv.get<string[]>("batch-dates")) ?? []
}

export async function recentBatches(limit: number): Promise<Batch[]> {
  const dates = (await listBatchDates()).slice(0, limit)
  const batches = await Promise.all(dates.map(getBatch))
  return batches.filter((b): b is Batch => b !== null)
}
