import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReplyDrafter } from "@/components/reply-drafter"
import { requireUserId } from "@/lib/session"
import { mentionLinks, peopleLinks, topicLinks, type EngageLink } from "@/lib/social"
import { getProfile } from "@/lib/store"

export const dynamic = "force-dynamic"

function LinkButton({ link, children }: { link: EngageLink; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={link.href} target="_blank" rel="noreferrer">
        {children} <ExternalLink />
      </a>
    </Button>
  )
}

export default async function RepliesPage() {
  const profile = await getProfile(await requireUserId())
  const people = peopleLinks(profile.xFollow, profile.linkedinFollow)
  const mentions = mentionLinks(profile.xHandle, profile.linkedinUrl)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Replies</h1>
        <p className="text-sm text-muted-foreground">
          Thoughtful replies on other people&apos;s posts grow your audience as much as your own posts. Find a post below,
          paste it here, and get reply drafts in your voice.
        </p>
      </div>

      <ReplyDrafter />

      <Card>
        <CardHeader>
          <CardTitle>Fresh posts on your topics</CardTitle>
          <CardDescription>Opens a live search, newest first. Look for posts from the last few hours with a few replies.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y">
            {profile.topics.map((topic) => {
              const links = topicLinks(topic)
              return (
                <li key={topic} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <span className="min-w-0 text-sm font-medium">{topic}</span>
                  <span className="flex gap-2">
                    <LinkButton link={links.linkedin}>LinkedIn</LinkButton>
                    <LinkButton link={links.x}>X</LinkButton>
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People you follow</CardTitle>
          <CardDescription>Being early in the replies on posts from people in your field is one of the fastest ways to get noticed.</CardDescription>
        </CardHeader>
        <CardContent>
          {people.length ? (
            <ul className="flex flex-col divide-y">
              {people.map((p) => (
                <li key={p.href} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.hint}</span>
                  </span>
                  <LinkButton link={p}>Open</LinkButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add the people you want to engage with in{" "}
              <Link href="/settings" className="font-medium text-foreground underline underline-offset-4">
                Settings
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Replies to you</CardTitle>
          <CardDescription>Answer people who replied to or mentioned you. It keeps conversations going.</CardDescription>
        </CardHeader>
        <CardContent>
          {mentions.length ? (
            <div className="flex flex-wrap gap-2">
              {mentions.map((m) => (
                <LinkButton key={m.href} link={m}>
                  {m.label}
                </LinkButton>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add your LinkedIn profile or X handle in{" "}
              <Link href="/settings" className="font-medium text-foreground underline underline-offset-4">
                Settings
              </Link>{" "}
              to see these.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
