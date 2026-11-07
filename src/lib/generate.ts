import "server-only"
import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import { z } from "zod"
import { todayIn } from "./dates"
import { frameworkIdeas, ideaBank } from "./idea-bank"
import { getProfile, recentBatches, saveBatch } from "./store"
import type { Batch, Idea, Profile, WorkItem } from "./types"
import { getRecentWork, templateWorkDraft } from "./work"

const MODEL = "claude-opus-5-5"
// If a request is declined by a safety classifier, the API re-runs it on
// Anthropic's recommended fallback model instead of returning a refusal.
const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default" as const,
}

let _client: Anthropic | null = null
const client = () => (_client ??= new Anthropic())

/** True when drafts come from the Claude API; false means the built-in idea bank. */
export const hasApiKey = () => Boolean(process.env.ANTHROPIC_API_KEY)

function profileBlock(p: Profile) {
  return [
    `Role: ${p.role}${p.name ? ` (${p.name})` : ""}`,
    `Audience: ${p.audience}`,
    `Areas of expertise:\n${p.topics.map((t) => `- ${t}`).join("\n")}`,
    `Voice: ${p.voice}`,
    `Avoid: ${p.avoid}`,
    p.samplePosts.trim() ? `Posts they liked or wrote (match this style):\n${p.samplePosts}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
}

/** Step 1: search the web for this week's news in the person's field. */
async function researchNews(p: Profile, date: string): Promise<string> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: "user",
      content: `Today is ${date}. Find 4 to 6 notable stories from the last 7 days that a ${p.role} could post about.

Focus: ${p.newsFocus}

For each story give: a headline, two sentences on what happened, one sentence on why it matters to ${p.audience}, and the source URL. Prefer primary sources and well-known publications. Skip anything older than 7 days.`,
    },
  ]

  // A long search turn can pause; send it back so the server continues it.
  for (let i = 0; i < 4; i++) {
    const res = await client().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
      messages,
      ...FALLBACK,
    })
    if (res.stop_reason === "refusal") throw new Error("The news research request was declined.")
    if (res.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: res.content })
      continue
    }
    return res.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
  }
  throw new Error("News research did not finish. Try again.")
}

const IdeasSchema = z.object({
  ideas: z.array(
    z.object({
      topic: z.string().describe("Short title for the idea, under 8 words"),
      kind: z.enum(["news", "expertise", "work"]),
      angle: z.string().describe("One sentence: the point of view the post takes"),
      whyNow: z.string().describe("One sentence: why this is worth posting today"),
      sourceUrl: z.string().nullable().describe("URL of the news story or work item, or null for expertise posts"),
      linkedin: z.string().describe("The full LinkedIn post"),
      x: z
        .array(z.string())
        .describe("The X post. One item for a single post, 3-6 items for a thread. Each item max 280 characters."),
    }),
  ),
})

/** Step 2: turn the news brief and the profile into ready-to-edit drafts. */
async function writeDrafts(p: Profile, brief: string, recentTopics: string[], work: WorkItem[]) {
  const workCount = work.length ? 1 : 0
  const newsCount = Math.ceil((p.ideasPerDay - workCount) / 2)
  const res = await client().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: betaZodOutputFormat(IdeasSchema) },
    system: `You write social posts for one person. Their profile:\n\n${profileBlock(p)}`,
    messages: [
      {
        role: "user",
        content: `Write ${p.ideasPerDay} post ideas for today: ${workCount ? `1 about their own recent work below (kind "work": what they built or designed, a decision behind it, or a lesson from it; set sourceUrl to that item's URL), ` : ""}${newsCount} reacting to a story in the news brief below (kind "news"), the rest drawn from their expertise (kind "expertise", e.g. a lesson, a how-to, a mistake to avoid, a before/after).

For each idea write both a LinkedIn post and an X post on the same idea, adapted to each platform:
- LinkedIn: open with a hook that works in the first two lines, then 120-250 words in short paragraphs. Give one concrete example or step. End with a takeaway or a genuine question. At most 3 hashtags, at the end.
- X: a single post of at most 280 characters, or a thread of 3-6 posts when the idea needs steps. Every post at most 280 characters. No hashtags unless essential.

Write as the person, in first person, in their voice. Don't invent personal stories, clients or numbers; where a personal detail would help, write it as a bracketed placeholder like [your project]. Don't repeat these recent topics: ${recentTopics.length ? recentTopics.join("; ") : "none yet"}.

News brief:
${brief || "(No news found today. Make every idea an expertise post.)"}${workCount ? `

Their recent work (commit messages and version notes are terse; turn them into plain language a non-engineer would follow, and don't claim results that aren't stated):
${work.slice(0, 4).map((w) => `## ${w.source === "github" ? "GitHub repo" : "Figma file"}: ${w.title}\nURL: ${w.url}\n${w.summary}`).join("\n\n")}` : ""}`,
      },
    ],
    ...FALLBACK,
  })
  if (res.stop_reason === "refusal") throw new Error("The drafting request was declined.")
  if (!res.parsed_output) throw new Error("The drafts came back in an unexpected format. Try again.")
  return res.parsed_output.ideas
}

export async function generateToday(uid: string, opts: { force?: boolean } = {}): Promise<Batch> {
  const profile = await getProfile(uid)
  const date = todayIn(profile.timezone)
  const recent = await recentBatches(uid, 14)
  const existing = recent.find((b) => b.date === date)
  if (existing && !opts.force) return existing

  const recentTopics = recent.filter((b) => b.date !== date).flatMap((b) => b.ideas.map((i) => i.topic))
  // Recent GitHub and Figma activity; failures here never block the day's drafts.
  const { items: work, errors: workErrors } = await getRecentWork(profile)
  if (workErrors.length) console.warn("Work sources:", workErrors)

  let brief = ""
  let drafts: z.infer<typeof IdeasSchema>["ideas"]
  if (hasApiKey()) {
    brief = await researchNews(profile, date)
    drafts = await writeDrafts(profile, brief, recentTopics, work)
  } else {
    const fromWork = pickWorkItem(work, recentTopics, opts.force ? (existing ?? null) : null)
    const bank = pickFromBank(profile, profile.ideasPerDay - (fromWork ? 1 : 0), recentTopics, opts.force ? (existing ?? null) : null)
    drafts = fromWork ? [{ ...templateWorkDraft(fromWork), kind: "work" as const, sourceUrl: fromWork.url }, ...bank] : bank
  }

  const ideas: Idea[] = drafts.map((d) => ({
    id: crypto.randomUUID(),
    topic: d.topic,
    kind: d.kind,
    angle: d.angle,
    whyNow: d.whyNow,
    sourceUrl: d.sourceUrl,
    imageUrl: d.kind === "work" ? (work.find((w) => w.url === d.sourceUrl)?.imageUrl ?? null) : null,
    linkedin: { text: d.linkedin, status: "draft" },
    x: { posts: d.x, status: "draft" },
  }))

  const batch: Batch = { date, createdAt: new Date().toISOString(), brief, ideas }
  await saveBatch(uid, batch)
  return batch
}

/** No-key mode: pick ideas from the built-in bank, skipping recent ones. */
const DESIGN_PROFESSIONS = ["ux-ui-designer", "product-designer"]

function pickFromBank(p: Profile, count: number, recentTopics: string[], replacing: Batch | null) {
  const bank = DESIGN_PROFESSIONS.includes(p.profession) ? ideaBank : frameworkIdeas(p)
  const exclude = new Set([...recentTopics, ...(replacing?.ideas.map((i) => i.topic) ?? [])])
  const fresh = bank.filter((i) => !exclude.has(i.topic))
  const pool = fresh.length >= count ? fresh : bank
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  // Prefer a different subject and post format for each idea on the same day.
  const angles = new Set<string>()
  const subjects = new Set<string>()
  const distinct = shuffled.filter((i) => {
    if (angles.has(i.angle) || (i.subject && subjects.has(i.subject))) return false
    angles.add(i.angle)
    if (i.subject) subjects.add(i.subject)
    return true
  })
  const picked = [...distinct, ...shuffled.filter((i) => !distinct.includes(i))].slice(0, Math.max(0, count))
  return picked.map((i) => ({
    topic: i.topic,
    kind: "expertise" as const,
    angle: i.angle,
    whyNow: i.whyNow,
    sourceUrl: null,
    linkedin: i.linkedin,
    x: i.x,
  }))
}

/** No-key mode: the most recent work item not already posted about. */
function pickWorkItem(work: WorkItem[], recentTopics: string[], replacing: Batch | null) {
  const used = new Set([...recentTopics, ...(replacing?.ideas.map((i) => i.topic) ?? [])])
  return work.find((w) => !used.has(templateWorkDraft(w).topic)) ?? null
}
