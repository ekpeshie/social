import { NextResponse } from "next/server"
import { generateToday } from "@/lib/generate"
import { listUsers } from "@/lib/store"

export const maxDuration = 300
const TIME_BUDGET_MS = 240_000

// Called once a day by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
// Users it doesn't reach in time get their drafts when they open the app.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const started = Date.now()
  let done = 0
  const failed: string[] = []
  const users = await listUsers()
  for (const uid of users) {
    if (Date.now() - started > TIME_BUDGET_MS) break
    try {
      await generateToday(uid)
      done++
    } catch (err) {
      console.error(`Generation failed for ${uid}`, err)
      failed.push(uid)
    }
  }
  return NextResponse.json({ users: users.length, generated: done, failed: failed.length })
}
