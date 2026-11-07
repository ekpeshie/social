"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { SESSION_COOKIE, sessionToken } from "@/lib/auth"
import { generateToday } from "@/lib/generate"
import { getBatch, getProfile, saveBatch, saveProfile } from "@/lib/store"
import type { PostStatus, Profile } from "@/lib/types"

export async function generateAction(force: boolean): Promise<{ error?: string }> {
  try {
    await generateToday({ force })
  } catch (err) {
    console.error(err)
    return { error: err instanceof Error ? err.message : "Couldn't generate posts." }
  }
  revalidatePath("/")
  return {}
}

export async function updatePostAction(input: {
  date: string
  ideaId: string
  platform: "linkedin" | "x"
  text?: string
  posts?: string[]
  status?: PostStatus
}) {
  const batch = await getBatch(input.date)
  const idea = batch?.ideas.find((i) => i.id === input.ideaId)
  if (!batch || !idea) throw new Error("That post no longer exists.")
  if (input.platform === "linkedin") {
    if (input.text !== undefined) idea.linkedin.text = input.text
    if (input.status) idea.linkedin.status = input.status
  } else {
    if (input.posts !== undefined) idea.x.posts = input.posts
    if (input.status) idea.x.status = input.status
  }
  await saveBatch(batch)
  revalidatePath("/")
  revalidatePath("/history")
}

export async function saveProfileAction(formData: FormData): Promise<{ error?: string }> {
  const current = await getProfile()
  const str = (k: string) => String(formData.get(k) ?? "").trim()
  const ideasPerDay = Math.min(6, Math.max(1, Number(formData.get("ideasPerDay")) || current.ideasPerDay))
  const timezone = str("timezone") || "UTC"
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone })
  } catch {
    return { error: `"${timezone}" isn't a time zone name. Use one like Africa/Lagos or America/New_York.` }
  }
  const profile: Profile = {
    name: str("name"),
    role: str("role") || current.role,
    audience: str("audience"),
    topics: str("topics").split("\n").map((t) => t.trim()).filter(Boolean),
    voice: str("voice"),
    avoid: str("avoid"),
    samplePosts: str("samplePosts"),
    newsFocus: str("newsFocus"),
    ideasPerDay,
    timezone,
  }
  await saveProfile(profile)
  revalidatePath("/", "layout")
  return {}
}

export async function loginAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const password = process.env.APP_PASSWORD
  if (!password) redirect("/")
  if (String(formData.get("password") ?? "") !== password) return { error: "That password is incorrect." }
  const jar = await cookies()
  jar.set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  })
  redirect("/")
}
