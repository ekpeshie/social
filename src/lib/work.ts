import "server-only"
import type { Profile, WorkItem } from "./types"

const DAY = 24 * 60 * 60 * 1000
const GITHUB_WINDOW_DAYS = 7
const FIGMA_WINDOW_DAYS = 14

export type WorkResult = { items: WorkItem[]; errors: string[] }

/** Repos and files to read, parsed from the profile's free-text fields. */
export function parseRepos(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, ""))
    .filter((l) => /^[\w.-]+\/[\w.-]+$/.test(l))
}

export function parseFigmaKey(url: string): string | null {
  const m = /figma\.com\/(?:design|file|proto)\/([A-Za-z0-9]+)(?:\/[^/?#]*)?(?:\/branch\/([A-Za-z0-9]+))?/.exec(url)
  if (!m) return null
  return m[2] ?? m[1]
}

// ---------- GitHub ----------

type GhRepo = { full_name: string; html_url: string; description: string | null; pushed_at: string; fork: boolean }
type GhCommit = { commit: { message: string; author: { date: string } | null }; author: { login: string } | null }
type GhRelease = { name: string | null; tag_name: string; html_url: string; published_at: string | null; body: string | null }

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "daily-posts",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`https://api.github.com/${path}`, { headers, cache: "no-store" })
  if (res.status === 401) throw new Error(process.env.GITHUB_TOKEN ? "GitHub rejected GITHUB_TOKEN. Check that it's valid and not expired." : `GitHub needs GITHUB_TOKEN to read ${path.split("?")[0].replace(/^repos\//, "")}. It may be private.`)
  if (res.status === 404) throw new Error(`GitHub couldn't find ${path.split("?")[0]}. Check the name, or add GITHUB_TOKEN for private repos.`)
  if (res.status === 403 || res.status === 429) throw new Error("GitHub's rate limit was reached. Add GITHUB_TOKEN to raise it, or try again in an hour.")
  if (!res.ok) throw new Error(`GitHub returned ${res.status} for ${path.split("?")[0]}.`)
  return res.json() as Promise<T>
}

/** Keeps the first line of each commit and drops merges, WIP and duplicates. */
export function cleanCommitMessages(messages: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of messages) {
    const line = raw.split("\n")[0].trim()
    const key = line.toLowerCase()
    if (line.length < 8 || /^merge\b/i.test(line) || /^(wip|fix|update|changes|test)\.?$/i.test(line) || seen.has(key)) continue
    seen.add(key)
    out.push(line)
  }
  return out
}

async function githubRepoWork(fullName: string, login: string | null): Promise<WorkItem | null> {
  const since = new Date(Date.now() - GITHUB_WINDOW_DAYS * DAY).toISOString()
  const [repo, commits, releases] = await Promise.all([
    gh<GhRepo>(`repos/${fullName}`),
    gh<GhCommit[]>(`repos/${fullName}/commits?since=${since}&per_page=50`).catch(() => [] as GhCommit[]),
    gh<GhRelease[]>(`repos/${fullName}/releases?per_page=3`).catch(() => [] as GhRelease[]),
  ])
  // With a username set, only count that person's commits.
  const mine = login ? commits.filter((c) => !c.author || c.author.login.toLowerCase() === login.toLowerCase()) : commits
  const changes = cleanCommitMessages(mine.map((c) => c.commit.message)).slice(0, 12)
  const release = releases.find((r) => r.published_at && Date.parse(r.published_at) > Date.now() - FIGMA_WINDOW_DAYS * DAY)
  if (changes.length === 0 && !release) return null

  const lines = [
    repo.description ? `Description: ${repo.description}` : "",
    release ? `Released ${release.name || release.tag_name}${release.body ? `: ${release.body.slice(0, 400)}` : ""}` : "",
    changes.length ? `${mine.length} commits in the last ${GITHUB_WINDOW_DAYS} days. Changes:\n${changes.map((c) => `- ${c}`).join("\n")}` : "",
  ].filter(Boolean)

  return {
    source: "github",
    title: repo.full_name.split("/")[1],
    url: release?.html_url ?? repo.html_url,
    summary: lines.join("\n"),
    details: changes,
    description: repo.description,
    imageUrl: null,
    updatedAt: repo.pushed_at,
  }
}

async function githubWork(p: Profile): Promise<WorkResult> {
  const errors: string[] = []
  const login = p.githubUsername.trim() || null
  const repos = new Set(parseRepos(p.githubRepos))
  if (login) {
    try {
      const recent = await gh<GhRepo[]>(`users/${login}/repos?sort=pushed&per_page=10&type=owner`)
      recent
        .filter((r) => !r.fork && Date.parse(r.pushed_at) > Date.now() - GITHUB_WINDOW_DAYS * DAY)
        .slice(0, 5)
        .forEach((r) => repos.add(r.full_name))
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }
  const results = await Promise.allSettled([...repos].map((r) => githubRepoWork(r, login)))
  const items: WorkItem[] = []
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) items.push(r.value)
    if (r.status === "rejected") errors.push(r.reason instanceof Error ? r.reason.message : String(r.reason))
  }
  return { items, errors }
}

// ---------- Figma ----------

type FigmaFile = {
  name: string
  lastModified: string
  thumbnailUrl?: string
  document?: { children?: { name: string; type: string }[] }
}
type FigmaVersion = { label: string | null; description: string | null; created_at: string; user?: { handle: string } }

async function figma<T>(path: string): Promise<T> {
  const token = process.env.FIGMA_TOKEN
  if (!token) throw new Error("Add FIGMA_TOKEN to read Figma files.")
  const res = await fetch(`https://api.figma.com/v1/${path}`, { headers: { "X-Figma-Token": token }, cache: "no-store" })
  if (res.status === 403) throw new Error("Figma refused access. Check that FIGMA_TOKEN is valid and can read this file.")
  if (res.status === 404) throw new Error("Figma couldn't find one of your files. Check the link.")
  if (res.status === 429) throw new Error("Figma's rate limit was reached. Try again later.")
  if (!res.ok) throw new Error(`Figma returned ${res.status}.`)
  return res.json() as Promise<T>
}

async function figmaFileWork(key: string): Promise<WorkItem | null> {
  const file = await figma<FigmaFile>(`files/${key}?depth=1`)
  if (Date.parse(file.lastModified) < Date.now() - FIGMA_WINDOW_DAYS * DAY) return null
  const versions = await figma<{ versions: FigmaVersion[] }>(`files/${key}/versions`).catch(() => ({ versions: [] }))
  const recentVersions = versions.versions
    .filter((v) => Date.parse(v.created_at) > Date.now() - FIGMA_WINDOW_DAYS * DAY && (v.label || v.description))
    .slice(0, 8)
  const pages = (file.document?.children ?? []).filter((c) => c.type === "CANVAS").map((c) => c.name)
  const notes = recentVersions.map((v) => [v.label, v.description].filter(Boolean).join(": "))

  return {
    source: "figma",
    title: file.name,
    url: `https://www.figma.com/design/${key}`,
    summary: [
      pages.length ? `Pages: ${pages.join(", ")}` : "",
      notes.length ? `Saved versions in the last ${FIGMA_WINDOW_DAYS} days:\n${notes.map((n) => `- ${n}`).join("\n")}` : "Edited recently (no named versions).",
    ]
      .filter(Boolean)
      .join("\n"),
    details: notes,
    description: pages.length ? `Pages: ${pages.slice(0, 5).join(", ")}` : null,
    imageUrl: file.thumbnailUrl ?? null,
    updatedAt: file.lastModified,
  }
}

async function figmaWork(p: Profile): Promise<WorkResult> {
  const lines = p.figmaFiles.split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return { items: [], errors: [] }
  if (!process.env.FIGMA_TOKEN) return { items: [], errors: ["Add FIGMA_TOKEN to read your Figma files."] }
  const errors: string[] = []
  const keys: string[] = []
  for (const l of lines) {
    const key = parseFigmaKey(l)
    if (key) keys.push(key)
    else errors.push(`"${l.slice(0, 60)}" isn't a Figma file link.`)
  }
  const results = await Promise.allSettled(keys.map(figmaFileWork))
  const items: WorkItem[] = []
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) items.push(r.value)
    if (r.status === "rejected") errors.push(r.reason instanceof Error ? r.reason.message : String(r.reason))
  }
  return { items, errors }
}

/** Everything you worked on recently, newest first. Never throws. */
export async function getRecentWork(p: Profile): Promise<WorkResult> {
  const [g, f] = await Promise.all([githubWork(p), figmaWork(p)])
  return {
    items: [...g.items, ...f.items].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    errors: [...new Set([...g.errors, ...f.errors])],
  }
}

export function hasWorkSources(p: Profile) {
  return Boolean(p.githubUsername.trim() || p.githubRepos.trim() || p.figmaFiles.trim())
}

// ---------- No-key drafts from work ----------

/** A rough "build in public" draft from one work item, for when there's no API key. */
export function templateWorkDraft(item: WorkItem) {
  if (item.source === "github") {
    const top = item.details.slice(0, 4)
    const linkedin = [
      `This week I've been building ${item.title}${item.description ? `: ${item.description.replace(/\.$/, "")}` : ""}.`,
      top.length ? `What changed:\n${top.map((c) => `→ ${c}`).join("\n")}` : "",
      "[One sentence on why you're building it, or the most interesting thing you learned.]",
      `See it here: ${item.url}`,
      "#BuildInPublic #ProductDesign",
    ]
      .filter(Boolean)
      .join("\n\n")
    const x = `This week on ${item.title}: ${top[0] ?? "shipped a round of updates"}.\n\n[What you learned]\n\n${item.url}`
    return {
      topic: `This week on ${item.title}`,
      angle: "Share what you shipped and what you learned.",
      whyNow: "You pushed changes this week. Rewrite the commit notes in plain language before posting.",
      linkedin,
      x: [x],
    }
  }
  const linkedin = [
    `Work in progress: ${item.title}.`,
    item.details.length
      ? `What I worked on recently:\n${item.details.slice(0, 4).map((d) => `→ ${d}`).join("\n")}`
      : "[What you designed this week, in one or two lines.]",
    "[The problem this design solves, and one decision you made along the way.]",
    "[Attach a screenshot of your favorite frame.]",
    "#UIDesign #WorkInProgress",
  ].join("\n\n")
  return {
    topic: `Work in progress: ${item.title}`,
    angle: "Show a design in progress and one decision behind it.",
    whyNow: "You edited this file recently. Only share it if the work is yours to show publicly.",
    linkedin,
    x: [`Work in progress: ${item.title}.\n\n[One decision you made and why.]\n\n[Attach a screenshot]`],
  }
}
