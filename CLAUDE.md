# Daily Posts

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 app that drafts daily LinkedIn and X posts for review.

## Design system: shadcn/ui (always)

Use shadcn/ui for all UI unless told otherwise.
- Components live in `src/components/ui/` (new-york style, Radix primitives, neutral base color). Add new ones with `npx shadcn@latest add <name>`; if the registry is unreachable, copy the component from `apps/v4/registry/new-york-v4/ui/` in github.com/shadcn-ui/ui and change `from "cn"` to `from "@/lib/utils"`.
- Style with semantic tokens only (`bg-background`, `text-muted-foreground`, `border-input`, `bg-primary`). No raw palette classes (`bg-zinc-900`) or hex values. Tokens are in `src/app/globals.css`, light on `:root`, dark on `.dark`.
- Compose existing parts (Card + CardHeader + CardTitle…) and pass `className`; extend variants inside the component's `cva()`.
- Sentence case for all UI text. One primary button per view. Icons from `lucide-react`.

## Layout
- No sign-up: `/onboarding` (profession, posts per day, optional LinkedIn/X accounts) creates a profile and a `uid` cookie (`src/lib/session.ts`). All data is per user; pages call `requireUserId()`.
- `src/lib/professions.ts`: profession presets. Designers get the hand-written `ideaBank`; others get `frameworkIdeas()` (both in `src/lib/idea-bank.ts`).
- `src/lib/work.ts`: recent GitHub (`GITHUB_TOKEN` optional) and Figma (`FIGMA_TOKEN`) activity for "From your work" ideas.
- `/replies` + `src/lib/social.ts`, `src/lib/replies.ts`: LinkedIn and X don't let apps read feeds for free, so the app links to live searches and drafts replies to pasted posts.
- `src/lib/generate.ts`: drafting. With `ANTHROPIC_API_KEY`, step 1 searches the web for news, step 2 writes structured drafts (model `claude-opus-5-5`). Without a key it picks from `src/lib/idea-bank.ts`.
- `src/lib/store.ts`: Upstash Redis when its env vars are set, else `.data/db.json`. Keys are `u:<uid>:…`; `users` lists every uid.
- `src/app/actions.ts`: server actions for the UI. `src/app/api/cron/generate`: daily Vercel Cron, loops over all users within a time budget.
- `src/middleware.ts`: sends visitors without a `uid` cookie to onboarding; optional site-wide password gate when `APP_PASSWORD` is set.

## Commands
`npm run dev`, `npm run build`, `npm run lint`, `npx tsc --noEmit`.
