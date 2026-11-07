export type PostStatus = "draft" | "approved" | "posted" | "skipped"

export type Profile = {
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
}

export type Idea = {
  id: string
  topic: string
  angle: string
  kind: "news" | "expertise"
  whyNow: string
  sourceUrl: string | null
  linkedin: { text: string; status: PostStatus }
  x: { posts: string[]; status: PostStatus }
}

export type Batch = {
  date: string // YYYY-MM-DD in the profile's timezone
  createdAt: string
  brief: string
  ideas: Idea[]
}
