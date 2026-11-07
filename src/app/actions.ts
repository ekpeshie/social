"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { SESSION_COOKIE, sessionToken } from "@/lib/auth"
import { defaultProfile } from "@/lib/defaults"
import { generateToday } from "@/lib/generate"
import { professionById } from "@/lib/professions"
import { draftReplies, type ReplyDraft } from "@/lib/replies"
import { currentUserId, requireUserId, setUserCookie } from "@/lib/session"
import { normalizeLinkedinUrl, normalizeXHandle } from "@/lib/social"
import { getBatch, getProfile, saveBatch, saveProfile } from "@/lib/store"
import type { PostStatus, Profile, WorkItem } from "@/lib/types"
import { getRecentWork } from "@/lib/work"

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback)

function validTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz })
    return true
  } catch {
    return false
  }
}

export async function generateAction(force: boolean): Promise<{ error?: string }> {
  const uid = await requireUserId()
  try {
    await generateToday(uid, { force })
  } catch (err) {
    console.error(err)
    return { error: errorMessage(err, "Couldn't generate posts.") }
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
  const uid = await requireUserId()
  const batch = await getBatch(uid, input.date)
  const idea = batch?.ideas.find((i) => i.id === input.ideaId)
  if (!batch || !idea) throw new Error("That post no longer exists.")
  if (input.platform === "linkedin") {
    if (input.text !== undefined) idea.linkedin.text = input.text
    if (input.status) idea.linkedin.status = input.status
  } else {
    if (input.posts !== undefined) idea.x.posts = input.posts
    if (input.status) idea.x.status = input.status
  }
  await saveBatch(uid, batch)
  revalidatePath("/")
  revalidatePath("/history")
}

export type OnboardingInput = {
  profession: string
  otherRole: string
  ideasPerDay: number
  linkedinUrl: string
  xHandle: string
  timezone: string
}

/** Creates this browser's profile. No account: the id lives in a cookie. */
export async function onboardAction(input: OnboardingInput): Promise<{ error?: string }> {
  const profession = professionById(input.profession)
  const otherRole = input.otherRole.trim()
  if (!profession && !otherRole) return { error: "Choose your profession, or type it under Other." }

  const linkedinUrl = normalizeLinkedinUrl(input.linkedinUrl)
  if (input.linkedinUrl.trim() && !linkedinUrl)
    return { error: "That LinkedIn link should look like linkedin.com/in/your-name." }
  const xHandle = normalizeXHandle(input.xHandle)
  if (input.xHandle.trim() && !xHandle) return { error: "X handles use letters, numbers and underscores, up to 15 characters." }

  const preset = profession?.preset ?? {
    role: otherRole,
    audience: `People who work with or want to become a ${otherRole}.`,
    topics: [`Getting started as a ${otherRole}`, "Lessons from my work", "Tools I use", "Common mistakes in my field"],
    newsFocus: `News and trends relevant to a ${otherRole}.`,
  }
  const profile: Profile = {
    ...defaultProfile,
    ...preset,
    profession: profession?.id ?? "other",
    ideasPerDay: Math.min(5, Math.max(1, Math.round(input.ideasPerDay) || 3)),
    timezone: validTimezone(input.timezone) ? input.timezone : "UTC",
    linkedinUrl: linkedinUrl ?? "",
    xHandle: xHandle ?? "",
  }

  const uid = (await currentUserId()) ?? crypto.randomUUID()
  await saveProfile(uid, profile)
  await setUserCookie(uid)
  redirect("/")
}

export async function saveProfileAction(formData: FormData): Promise<{ error?: string }> {
  const uid = await requireUserId()
  const current = await getProfile(uid)
  const str = (k: string) => String(formData.get(k) ?? "").trim()
  const ideasPerDay = Math.min(5, Math.max(1, Number(formData.get("ideasPerDay")) || current.ideasPerDay))
  const timezone = str("timezone") || "UTC"
  if (!validTimezone(timezone)) {
    return { error: `"${timezone}" isn't a time zone name. Use one like Africa/Lagos or America/New_York.` }
  }
  const linkedinUrl = normalizeLinkedinUrl(str("linkedinUrl"))
  if (str("linkedinUrl") && !linkedinUrl) return { error: "Your LinkedIn link should look like linkedin.com/in/your-name." }
  const xHandle = normalizeXHandle(str("xHandle"))
  if (str("xHandle") && !xHandle) return { error: "Your X handle can only use letters, numbers and underscores." }

  const profile: Profile = {
    ...current,
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
    githubUsername: str("githubUsername").replace(/^@/, ""),
    githubRepos: str("githubRepos"),
    figmaFiles: str("figmaFiles"),
    linkedinUrl: linkedinUrl ?? "",
    xHandle: xHandle ?? "",
    xFollow: str("xFollow"),
    linkedinFollow: str("linkedinFollow"),
  }
  await saveProfile(uid, profile)
  revalidatePath("/", "layout")
  return {}
}

/** Reads the saved GitHub and Figma sources and reports what it finds. */
export async function checkWorkAction(): Promise<{ items: WorkItem[]; errors: string[] }> {
  const uid = await requireUserId()
  return getRecentWork(await getProfile(uid))
}

export async function draftRepliesAction(input: {
  post: string
  platform: "linkedin" | "x"
}): Promise<{ replies?: ReplyDraft[]; templated?: boolean; error?: string }> {
  const uid = await requireUserId()
  const post = input.post.trim()
  if (post.length < 20) return { error: "Paste the full text of the post you want to reply to." }
  if (post.length > 6000) return { error: "That post is too long. Paste just the post, without the comments." }
  try {
    const replies = await draftReplies(await getProfile(uid), post.slice(0, 6000), input.platform)
    return { replies, templated: !process.env.ANTHROPIC_API_KEY }
  } catch (err) {
    console.error(err)
    return { error: errorMessage(err, "Couldn't draft replies.") }
  }
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
