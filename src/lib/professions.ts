import type { Profile } from "./types"

export type Profession = {
  id: string
  label: string
  description: string
  preset: Pick<Profile, "role" | "audience" | "topics" | "newsFocus">
}

export const professions: Profession[] = [
  {
    id: "ux-ui-designer",
    label: "UX/UI designer",
    description: "Interfaces, user research, design systems",
    preset: {
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
      newsFocus:
        "Product design and UX news: Figma and design-tool releases, notable redesigns, accessibility rules and lawsuits, AI design tools, design hiring trends.",
    },
  },
  {
    id: "product-designer",
    label: "Product designer",
    description: "End-to-end product, strategy and craft",
    preset: {
      role: "Product designer",
      audience: "Product teams, founders and fellow designers at startups and tech companies.",
      topics: [
        "Working with product managers and engineers",
        "Designing onboarding",
        "Rapid prototyping",
        "Design critique",
        "Growing into a senior designer",
      ],
      newsFocus: "Product launches and redesigns, design-tool releases, product-led growth, AI in product design.",
    },
  },
  {
    id: "software-engineer",
    label: "Software engineer",
    description: "Building, shipping and maintaining software",
    preset: {
      role: "Software engineer",
      audience: "Other developers, engineering managers and technical founders.",
      topics: [
        "Writing maintainable code",
        "Code reviews",
        "Debugging production issues",
        "AI coding tools",
        "Career growth for engineers",
      ],
      newsFocus:
        "Software engineering news: language and framework releases, developer tools, AI coding assistants, notable outages and postmortems.",
    },
  },
  {
    id: "product-manager",
    label: "Product manager",
    description: "Roadmaps, discovery and shipping outcomes",
    preset: {
      role: "Product manager",
      audience: "Product managers, founders, and the designers and engineers they work with.",
      topics: [
        "Customer discovery",
        "Prioritization",
        "Writing clear specs",
        "Product metrics",
        "Working with design and engineering",
      ],
      newsFocus: "Product management news: notable launches, pricing changes, AI product strategy, product org trends.",
    },
  },
  {
    id: "marketer",
    label: "Marketer",
    description: "Growth, content, brand and campaigns",
    preset: {
      role: "Marketer",
      audience: "Marketers, founders and small-business owners who want to grow.",
      topics: [
        "Content marketing",
        "Positioning and messaging",
        "Email and lifecycle marketing",
        "Marketing analytics",
        "AI marketing tools",
      ],
      newsFocus: "Marketing news: platform algorithm changes, notable campaigns, ad and privacy rules, AI marketing tools.",
    },
  },
  {
    id: "founder",
    label: "Founder",
    description: "Starting and running a company",
    preset: {
      role: "Founder",
      audience: "Other founders, early employees, investors and potential customers.",
      topics: [
        "Finding first customers",
        "Hiring a first team",
        "Fundraising",
        "Building in public",
        "Staying focused as a founder",
      ],
      newsFocus: "Startup news: funding rounds and trends, notable launches and shutdowns, AI startups, policy affecting small companies.",
    },
  },
  {
    id: "data-scientist",
    label: "Data scientist",
    description: "Analytics, ML and data storytelling",
    preset: {
      role: "Data scientist",
      audience: "Data practitioners, analysts and the business teams who use their work.",
      topics: [
        "Turning analysis into decisions",
        "Data quality",
        "Explaining models to non-experts",
        "Practical machine learning",
        "Careers in data",
      ],
      newsFocus: "Data and AI news: model releases, data tools, research with practical impact, data privacy rules.",
    },
  },
  {
    id: "content-creator",
    label: "Content creator",
    description: "Writing, video and building an audience",
    preset: {
      role: "Content creator",
      audience: "Aspiring and growing creators, and brands that work with creators.",
      topics: [
        "Coming up with ideas",
        "Hooks and storytelling",
        "Growing an audience",
        "Making money as a creator",
        "Creator tools and workflows",
      ],
      newsFocus: "Creator economy news: platform features and policy changes, monetization programs, notable creator businesses.",
    },
  },
]

export const professionById = (id: string) => professions.find((p) => p.id === id)
