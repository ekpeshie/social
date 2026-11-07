// Helpers for LinkedIn and X links. Neither platform lets apps read feeds
// for free, so the app links to live searches instead of fetching posts.

export function normalizeXHandle(input: string): string | null {
  const v = input.trim().replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0]
  return /^[A-Za-z0-9_]{1,15}$/.test(v) ? v : null
}

export function normalizeLinkedinUrl(input: string): string | null {
  const m = /linkedin\.com\/in\/([A-Za-z0-9\-_%]+)/i.exec(input.trim())
  return m ? `https://www.linkedin.com/in/${m[1]}` : null
}

export const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean)

export type EngageLink = { label: string; href: string; hint?: string }

const xSearch = (q: string) => `https://x.com/search?q=${encodeURIComponent(q)}&f=live`
const linkedinSearch = (q: string) =>
  `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(q)}&sortBy=%22date_posted%22`

/** Short search phrase from a topic like "Design systems and component libraries". */
export function topicQuery(topic: string) {
  return topic.split(/\band\b|,|:|\(/)[0].trim()
}

export function topicLinks(topic: string): { x: EngageLink; linkedin: EngageLink } {
  const q = topicQuery(topic)
  return {
    // Original posts with some traction, newest first, no replies.
    x: { label: q, href: xSearch(`${q} min_faves:10 -filter:replies lang:en`) },
    linkedin: { label: q, href: linkedinSearch(q) },
  }
}

export function peopleLinks(xFollow: string, linkedinFollow: string): EngageLink[] {
  const handles = lines(xFollow).map(normalizeXHandle).filter((h): h is string => !!h)
  const links: EngageLink[] = []
  // X search queries have a length limit, so group handles in chunks.
  for (let i = 0; i < handles.length; i += 8) {
    const chunk = handles.slice(i, i + 8)
    links.push({
      label: chunk.map((h) => `@${h}`).join(", "),
      href: xSearch(`${chunk.map((h) => `from:${h}`).join(" OR ")} -filter:replies`),
      hint: "Latest posts on X",
    })
  }
  for (const url of lines(linkedinFollow).map(normalizeLinkedinUrl).filter((u): u is string => !!u)) {
    links.push({
      label: decodeURIComponent(url.split("/in/")[1]).replace(/-[0-9a-f]{6,}$/i, "").replace(/-/g, " "),
      href: `${url}/recent-activity/all/`,
      hint: "Recent activity on LinkedIn",
    })
  }
  return links
}

export function mentionLinks(xHandle: string, linkedinUrl: string): EngageLink[] {
  const out: EngageLink[] = []
  if (xHandle) out.push({ label: `Replies and mentions of @${xHandle}`, href: xSearch(`@${xHandle} -from:${xHandle}`) })
  if (linkedinUrl) out.push({ label: "Your LinkedIn notifications", href: "https://www.linkedin.com/notifications/" })
  return out
}
