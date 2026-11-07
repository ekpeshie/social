import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/post-editor"
import { formatDay } from "@/lib/dates"
import { requireUserId } from "@/lib/session"
import { recentBatches } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function HistoryPage() {
  const batches = await recentBatches(await requireUserId(), 30)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">The last 30 days of ideas and what you did with them.</p>
      </div>
      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing here yet. Your first drafts will appear on <Link className="underline underline-offset-4" href="/">Today</Link>.
        </p>
      ) : (
        batches.map((batch) => (
          <Card key={batch.date}>
            <CardHeader>
              <CardTitle>{formatDay(batch.date)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col divide-y">
                {batch.ideas.map((idea) => (
                  <li key={idea.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0 text-sm font-medium">{idea.topic}</span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">LinkedIn <StatusBadge status={idea.linkedin.status} /></span>
                      <span className="flex items-center gap-1.5">X <StatusBadge status={idea.x.status} /></span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
