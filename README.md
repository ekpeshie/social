# Daily Posts

Each day you get a few post ideas, each with a LinkedIn draft and an X draft. Edit them, then copy or open them in each app with one click, and mark what you posted. Nothing is ever posted for you.

There's no sign-up. New visitors pick their profession and how many posts they want a day, and can add their LinkedIn and X accounts. Their profile is tied to their browser (a cookie), so clearing cookies starts over.

Built with Next.js and [shadcn/ui](https://ui.shadcn.com).

## Run it locally (no keys needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click **Write today's posts**. Without an API key, drafts come from a built-in bank of UX/UI post ideas (`src/lib/idea-bank.ts`). Data is saved to `.data/db.json`.

## Turn on news-based drafts

Add an Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then each run searches the web for this week's design news and writes drafts in your voice from the profile on the **Settings** page.

## Replies

The **Replies** page helps you join conversations:
- **Draft a reply:** paste someone's post and get three reply options in your voice. With an API key they're written to the post; without one they're structures to fill in.
- **Fresh posts on your topics:** one-click live searches on LinkedIn and X, newest first.
- **People you follow:** links to the latest posts of the people you list in Settings.
- **Replies to you:** your X mentions and LinkedIn notifications.

LinkedIn doesn't let regular apps read feeds, and X charges for read access, so the app links to the platforms' own searches instead of pulling posts in.

## Posts from your own work

In **Settings → Your work**, add your GitHub username, specific repos, or Figma file links. When there's recent activity (GitHub: 7 days, Figma: 14 days), one idea each day is about that work: what you built or designed and why.

- Public GitHub repos need no token. Add `GITHUB_TOKEN` for private repos.
- Figma needs `FIGMA_TOKEN` (a free personal access token).
- Without an Anthropic key these drafts are rough templates built from commit messages and version notes. With a key they're written properly.
- Only add work you're allowed to share publicly.

## Deploy to Vercel

1. Import this repo in Vercel.
2. Add the **Upstash Redis** integration from the Vercel Marketplace (free tier) so data persists.
3. Set `CRON_SECRET`, and `APP_PASSWORD` only if you want a private copy, plus `ANTHROPIC_API_KEY` if you want news-based drafts.
4. Deploy. `vercel.json` runs the daily job at 06:00 UTC; change the schedule there.

See `.env.example` for every setting.
