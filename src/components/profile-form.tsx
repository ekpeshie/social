"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { saveProfileAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export function ProfileForm({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition()
  return (
    <form
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
          <CardDescription>Used when an API key is set. The built-in idea bank is written for UX/UI designers.</CardDescription>
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
            <Field id="ideasPerDay" label="Ideas per day" hint="1 to 6.">
              <Input id="ideasPerDay" name="ideasPerDay" type="number" min={1} max={6} defaultValue={profile.ideasPerDay} />
            </Field>
            <Field id="timezone" label="Time zone" hint="Decides when a new day starts, e.g. Africa/Lagos.">
              <Input id="timezone" name="timezone" defaultValue={profile.timezone} />
            </Field>
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
