import "server-only"
import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import { z } from "zod"
import { todayIn } from "./dates"
import { ideaBank } from "./idea-bank"
import { getProfile, recentBatches, saveBatch } from "./store"
import type { Batch, Idea, Profile } from "./types"

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
      kind: z.enum(["news", "expertise"]),
      angle: z.string().describe("One sentence: the point of view the post takes"),
      whyNow: z.string().describe("One sentence: why this is worth posting today"),
      sourceUrl: z.string().nullable().describe("URL of the news story, or null for expertise posts"),
      linkedin: z.string().describe("The full LinkedIn post"),
      x: z
        .array(z.string())
        .describe("The X post. One item for a single post, 3-6 items for a thread. Each item max 280 characters."),
    }),
  ),
})

/** Step 2: turn the news brief and the profile into ready-to-edit drafts. */
async function writeDrafts(p: Profile, brief: string, recentTopics: string[]) {
  const newsCount = Math.ceil(p.ideasPerDay / 2)
  const res = await client().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: betaZodOutputFormat(IdeasSchema) },
    system: `You write social posts for one person. Their profile:\n\n${profileBlock(p)}`,
    messages: [
      {
        role: "user",
        content: `Write ${p.ideasPerDay} post ideas for today: ${newsCount} reacting to a story in the news brief below (kind "news"), the rest drawn from their expertise (kind "expertise", e.g. a lesson, a how-to, a mistake to avoid, a before/after).

For each idea write both a LinkedIn post and an X post on the same idea, adapted to each platform:
- LinkedIn: open with a hook that works in the first two lines, then 120-250 words in short paragraphs. Give one concrete example or step. End with a takeaway or a genuine question. At most 3 hashtags, at the end.
- X: a single post of at most 280 characters, or a thread of 3-6 posts when the idea needs steps. Every post at most 280 characters. No hashtags unless essential.

Write as the person, in first person, in their voice. Don't invent personal stories, clients or numbers; where a personal detail would help, write it as a bracketed placeholder like [your project]. Don't repeat these recent topics: ${recentTopics.length ? recentTopics.join("; ") : "none yet"}.

News brief:
${brief || "(No news found today. Make every idea an expertise post.)"}`,
      },
    ],
    ...FALLBACK,
  })
  if (res.stop_reason === "refusal") throw new Error("The drafting request was declined.")
  if (!res.parsed_output) throw new Error("The drafts came back in an unexpected format. Try again.")
  return res.parsed_output.ideas
}

export async function generateToday(opts: { force?: boolean } = {}): Promise<Batch> {
  const profile = await getProfile()
  const date = todayIn(profile.timezone)
  const recent = await recentBatches(14)
  const existing = recent.find((b) => b.date === date)
  if (existing && !opts.force) return existing

  const recentTopics = recent.filter((b) => b.date !== date).flatMap((b) => b.ideas.map((i) => i.topic))
  let brief = ""
  let drafts: z.infer<typeof IdeasSchema>["ideas"]
  if (hasApiKey()) {
    brief = await researchNews(profile, date)
    drafts = await writeDrafts(profile, brief, recentTopics)
  } else {
    drafts = pickFromBank(profile.ideasPerDay, recentTopics, opts.force ? (existing ?? null) : null)
  }

  const ideas: Idea[] = drafts.map((d) => ({
    id: crypto.randomUUID(),
    topic: d.topic,
    kind: d.kind,
    angle: d.angle,
    whyNow: d.whyNow,
    sourceUrl: d.sourceUrl,
    linkedin: { text: d.linkedin, status: "draft" },
    x: { posts: d.x, status: "draft" },
  }))

  const batch: Batch = { date, createdAt: new Date().toISOString(), brief, ideas }
  await saveBatch(batch)
  return batch
}

/** No-key mode: pick ideas from the built-in bank, skipping recent ones. */
function pickFromBank(count: number, recentTopics: string[], replacing: Batch | null) {
  const exclude = new Set([...recentTopics, ...(replacing?.ideas.map((i) => i.topic) ?? [])])
  const fresh = ideaBank.filter((i) => !exclude.has(i.topic))
  const pool = fresh.length >= count ? fresh : ideaBank
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((i) => ({
    topic: i.topic,
    kind: "expertise" as const,
    angle: i.angle,
    whyNow: i.whyNow,
    sourceUrl: null,
    linkedin: i.linkedin,
    x: i.x,
  }))
}
