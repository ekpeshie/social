import type { Profile } from "./types"

export const defaultProfile: Profile = {
  name: "",
  profession: "ux-ui-designer",
  role: "UX/UI designer",
  audience:
    "Product designers, founders and product managers who want better user experiences; hiring managers looking for designers.",
  topics: [
    "Design systems and component libraries",
    "UX research on a budget",
    "Accessibility in everyday UI",
    "AI tools in the design workflow",
    "Portfolio and career advice for designers",
  ],
  voice: "Practical and friendly. Specific examples over theory. No buzzwords, no hype.",
  avoid: "Engagement bait, 'Agree?' endings, more than 3 hashtags, emoji walls.",
  samplePosts: "",
  newsFocus:
    "Product design and UX news: Figma and design-tool releases, notable redesigns, accessibility rules and lawsuits, AI design tools, design hiring trends.",
  ideasPerDay: 3,
  timezone: "UTC",
  githubUsername: "",
  githubRepos: "",
  figmaFiles: "",
  linkedinUrl: "",
  xHandle: "",
  xFollow: "",
  linkedinFollow: "",
}
