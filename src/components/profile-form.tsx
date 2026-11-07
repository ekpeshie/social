"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { saveProfileAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { WorkCheck } from "@/components/work-sources"
import type { Profile } from "@/lib/types"

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

type Props = {
  profile: Profile
  tokens: { github: boolean; figma: boolean }
  hasSources: boolean
}

function TokenBadge({ set, name }: { set: boolean; name: string }) {
  return <Badge variant={set ? "secondary" : "outline"}>{set ? `${name} connected` : `No ${name}`}</Badge>
}

export function ProfileForm({ profile, tokens, hasSources }: Props) {
  const [pending, startTransition] = useTransition()
  return (
    <form
      className="flex flex-col gap-6"
      action={(fd) =>
        startTransition(async () => {
          const { error } = await saveProfileAction(fd)
          if (error) toast.error(error)
          else toast.success("Settings saved")
        })
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>Every draft is written from this.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="name" label="Name">
              <Input id="name" name="name" defaultValue={profile.name} placeholder="Your name" />
            </Field>
            <Field id="role" label="Role">
              <Input id="role" name="role" defaultValue={profile.role} />
            </Field>
          </div>
          <Field id="audience" label="Who you want to reach">
            <Textarea id="audience" name="audience" defaultValue={profile.audience} />
          </Field>
          <Field id="topics" label="Your areas of expertise" hint="One per line.">
            <Textarea id="topics" name="topics" defaultValue={profile.topics.join("\n")} className="min-h-32" />
          </Field>
          <Field id="voice" label="Your voice">
            <Textarea id="voice" name="voice" defaultValue={profile.voice} />
          </Field>
          <Field id="avoid" label="Things to avoid">
            <Textarea id="avoid" name="avoid" defaultValue={profile.avoid} />
          </Field>
          <Field id="samplePosts" label="Example posts" hint="Paste 1-3 posts you wrote or liked. Drafts will match their style.">
            <Textarea id="samplePosts" name="samplePosts" defaultValue={profile.samplePosts} className="min-h-32" />
          </Field>
          <Field id="newsFocus" label="News to follow">
            <Textarea id="newsFocus" name="newsFocus" defaultValue={profile.newsFocus} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="ideasPerDay" label="Ideas per day" hint="1 to 5.">
              <Input id="ideasPerDay" name="ideasPerDay" type="number" min={1} max={5} defaultValue={profile.ideasPerDay} />
            </Field>
            <Field id="timezone" label="Time zone" hint="Decides when a new day starts, e.g. Africa/Lagos.">
              <Input id="timezone" name="timezone" defaultValue={profile.timezone} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your accounts</CardTitle>
          <CardDescription>
            Used on the Replies page to find posts to reply to. The app never posts or logs in for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="linkedinUrl" label="Your LinkedIn profile">
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                defaultValue={profile.linkedinUrl}
                placeholder="linkedin.com/in/your-name"
              />
            </Field>
            <Field id="xHandle" label="Your X handle">
              <Input id="xHandle" name="xHandle" defaultValue={profile.xHandle} placeholder="@yourhandle" />
            </Field>
          </div>
          <Field id="xFollow" label="People to engage with on X" hint="One handle per line.">
            <Textarea id="xFollow" name="xFollow" defaultValue={profile.xFollow} placeholder={"@figma\n@someone"} />
          </Field>
          <Field id="linkedinFollow" label="People to engage with on LinkedIn" hint="One profile link per line.">
            <Textarea
              id="linkedinFollow"
              name="linkedinFollow"
              defaultValue={profile.linkedinFollow}
              placeholder="https://www.linkedin.com/in/their-name"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your work</CardTitle>
          <CardDescription>
            When you&apos;ve pushed code or edited a design recently, one idea each day is about that work. Only add
            work you&apos;re allowed to share publicly; client files under NDA don&apos;t belong here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="githubUsername"
              label="GitHub username"
              hint="Reads your public repos pushed in the last 7 days."
            >
              <Input id="githubUsername" name="githubUsername" defaultValue={profile.githubUsername} placeholder="ekpeshie" />
            </Field>
            <div className="flex flex-col gap-2">
              <Label>Access</Label>
              <div className="flex flex-wrap gap-2">
                <TokenBadge set={tokens.github} name="GITHUB_TOKEN" />
                <TokenBadge set={tokens.figma} name="FIGMA_TOKEN" />
              </div>
              <p className="text-xs text-muted-foreground">
                Public GitHub repos need no token. Private repos need GITHUB_TOKEN; Figma always needs FIGMA_TOKEN.
              </p>
            </div>
          </div>
          <Field id="githubRepos" label="Specific GitHub repos" hint="Optional. One per line, as owner/repo or a link.">
            <Textarea id="githubRepos" name="githubRepos" defaultValue={profile.githubRepos} placeholder="ekpeshie/social" />
          </Field>
          <Field
            id="figmaFiles"
            label="Figma files"
            hint="One link per line. Reads the file name, pages, named versions and thumbnail of files edited in the last 14 days."
          >
            <Textarea
              id="figmaFiles"
              name="figmaFiles"
              defaultValue={profile.figmaFiles}
              placeholder="https://www.figma.com/design/AbC123/Portfolio-redesign"
            />
          </Field>
          <WorkCheck disabled={!hasSources} />
        </CardContent>
      </Card>

      <Button type="submit" className="self-start" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  )
}
