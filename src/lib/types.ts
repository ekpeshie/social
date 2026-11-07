export type PostStatus = "draft" | "approved" | "posted" | "skipped"

export type Profile = {
  profession: string // id from professions.ts, or "other"
  name: string
  role: string
  audience: string
  topics: string[]
  voice: string
  avoid: string
  samplePosts: string
  newsFocus: string
  ideasPerDay: number
  timezone: string
  githubUsername: string
  githubRepos: string // one owner/repo per line
  figmaFiles: string // one Figma file link per line
  linkedinUrl: string
  xHandle: string
  xFollow: string // X handles to engage with, one per line
  linkedinFollow: string // LinkedIn profile links to engage with, one per line
}

export type Idea = {
  id: string
  topic: string
  angle: string
  kind: "news" | "expertise" | "work"
  whyNow: string
  sourceUrl: string | null
  imageUrl?: string | null
  linkedin: { text: string; status: PostStatus }
  x: { posts: string[]; status: PostStatus }
}

export type Batch = {
  date: string // YYYY-MM-DD in the profile's timezone
  createdAt: string
  brief: string
  ideas: Idea[]
}

export type WorkItem = {
  source: "github" | "figma"
  title: string
  url: string
  summary: string // plain-text notes passed to the writer
  details: string[] // cleaned commit messages or version notes
  description: string | null
  imageUrl: string | null
  updatedAt: string
}
