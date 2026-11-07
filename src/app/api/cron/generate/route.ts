import { NextResponse } from "next/server"
import { generateToday } from "@/lib/generate"

export const maxDuration = 300

// Called once a day by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const batch = await generateToday()
    return NextResponse.json({ date: batch.date, ideas: batch.ideas.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Generation failed" }, { status: 500 })
  }
}
