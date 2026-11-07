"use client"

import { useState, useTransition } from "react"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { draftRepliesAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Reply = { style: string; text: string }

export function ReplyDrafter() {
  const [platform, setPlatform] = useState<"linkedin" | "x">("linkedin")
  const [post, setPost] = useState("")
  const [replies, setReplies] = useState<Reply[]>([])
  const [templated, setTemplated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft a reply</CardTitle>
        <CardDescription>Paste the text of a post you want to reply to.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={platform}
          onValueChange={(v) => v && setPlatform(v as "linkedin" | "x")}
          aria-label="Platform"
          className="self-start"
        >
          <ToggleGroupItem value="linkedin">LinkedIn</ToggleGroupItem>
          <ToggleGroupItem value="x">X</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex flex-col gap-2">
          <Label htmlFor="post" className="sr-only">
            Post to reply to
          </Label>
          <Textarea
            id="post"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Paste the post here"
            className="min-h-32"
            aria-invalid={!!error}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button
          className="self-start"
          disabled={pending || !post.trim()}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              const res = await draftRepliesAction({ post, platform })
              if (res.error) setError(res.error)
              else {
                setReplies(res.replies ?? [])
                setTemplated(!!res.templated)
              }
            })
          }
        >
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Drafting…" : "Draft replies"}
        </Button>

        {replies.length > 0 && templated && (
          <p className="text-sm text-muted-foreground">
            These are reply structures to fill in. With an Anthropic API key, replies are written to the post itself.
          </p>
        )}
        {replies.length > 0 && (
          <ul className="flex flex-col gap-3">
            {replies.map((r, i) => (
              <li key={i} className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{r.style}</span>
                  <Button variant="ghost" size="sm" onClick={() => copy(r.text)}>
                    <Copy /> Copy
                  </Button>
                </div>
                <p className="text-sm leading-6 whitespace-pre-wrap">{r.text}</p>
                {platform === "x" && (
                  <p
                    className={cn(
                      "text-right text-xs tabular-nums text-muted-foreground",
                      r.text.length > 280 && "text-destructive",
                    )}
                  >
                    {r.text.length} / 280
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
