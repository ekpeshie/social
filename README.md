# Daily Posts

Each day you get a few post ideas, each with a LinkedIn draft and an X draft. Edit them, then copy or open them in each app with one click, and mark what you posted. Nothing is ever posted for you.

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

## Deploy to Vercel

1. Import this repo in Vercel.
2. Add the **Upstash Redis** integration from the Vercel Marketplace (free tier) so data persists.
3. Set `APP_PASSWORD` and `CRON_SECRET`, plus `ANTHROPIC_API_KEY` if you want news-based drafts.
4. Deploy. `vercel.json` runs the daily job at 06:00 UTC; change the schedule there.

See `.env.example` for every setting.
