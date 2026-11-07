import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GenerateButton } from "@/components/generate-button"
import { IdeaCard } from "@/components/idea-card"
import { formatDay, todayIn } from "@/lib/dates"
import { hasApiKey } from "@/lib/generate"
import { getBatch, getProfile } from "@/lib/store"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export default async function TodayPage() {
  const profile = await getProfile()
  const date = todayIn(profile.timezone)
  const batch = await getBatch(date)
  const live = hasApiKey()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{formatDay(date)}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Today&apos;s posts</h1>
        </div>
        {batch && <GenerateButton force label="Get new ideas" variant="outline" />}
      </div>

      {!live && (
        <Alert>
          <Info />
          <AlertTitle>Using the built-in idea bank</AlertTitle>
          <AlertDescription>
            These drafts come from ready-made UX/UI post ideas, not today&apos;s news. Add an Anthropic API key to get
            fresh drafts written for you each morning from current design news.
          </AlertDescription>
        </Alert>
      )}

      {batch ? (
        <div className="flex flex-col gap-6">
          {batch.ideas.map((idea) => (
            <IdeaCard key={idea.id} date={batch.date} idea={idea} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">No posts for today yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {live
                ? "Drafts are written automatically each morning. You can also write today's now; it takes a minute or two."
                : `Get ${profile.ideasPerDay} post ideas, each with a LinkedIn and an X draft you can edit.`}
            </p>
          </div>
          <GenerateButton label="Write today's posts" />
        </div>
      )}
    </div>
  )
}
