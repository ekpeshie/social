"use client"

import { useState, useTransition } from "react"
import { Check, Copy, ExternalLink, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { updatePostAction } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { PostStatus } from "@/lib/types"

const X_LIMIT = 280

const statusLabel: Record<PostStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  posted: "Posted",
  skipped: "Skipped",
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={status === "posted" ? "default" : status === "approved" ? "secondary" : "outline"}>
      {statusLabel[status]}
    </Badge>
  )
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  } catch {
    toast.error("Couldn't copy. Select the text and copy it manually.")
  }
}

type Props = {
  date: string
  ideaId: string
  platform: "linkedin" | "x"
  initial: string[]
  status: PostStatus
}

export function PostEditor({ date, ideaId, platform, initial, status }: Props) {
  const [posts, setPosts] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [pending, startTransition] = useTransition()
  const dirty = JSON.stringify(posts) !== JSON.stringify(saved)
  const isX = platform === "x"
  const fullText = posts.join("\n\n")
  const overLimit = isX && posts.some((p) => p.length > X_LIMIT)

  function save(nextStatus?: PostStatus) {
    startTransition(async () => {
      try {
        await updatePostAction({
          date,
          ideaId,
          platform,
          ...(isX ? { posts } : { text: posts[0] }),
          ...(nextStatus ? { status: nextStatus } : {}),
        })
        setSaved(posts)
        toast.success(nextStatus ? `Marked as ${statusLabel[nextStatus].toLowerCase()}` : "Saved")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't save.")
      }
    })
  }

  function openComposer() {
    const url = isX
      ? `https://x.com/intent/post?text=${encodeURIComponent(posts[0])}`
      : "https://www.linkedin.com/feed/?shareActive=true"
    if (!isX) void copy(fullText)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          {isX && posts.length > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Post {i + 1} of {posts.length}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove post ${i + 1}`}
                onClick={() => setPosts(posts.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          )}
          <Textarea
            value={p}
            onChange={(e) => setPosts(posts.map((q, j) => (j === i ? e.target.value : q)))}
            className={cn("min-h-28 text-sm leading-6", !isX && "min-h-64")}
            aria-invalid={isX && p.length > X_LIMIT}
            aria-label={isX ? `X post ${i + 1}` : "LinkedIn post"}
          />
          <div
            className={cn(
              "text-right text-xs tabular-nums text-muted-foreground",
              isX && p.length > X_LIMIT && "text-destructive",
            )}
          >
            {isX ? `${p.length} / ${X_LIMIT}` : `${p.split(/\s+/).filter(Boolean).length} words`}
          </div>
        </div>
      ))}
      {isX && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setPosts([...posts, ""])}>
          <Plus /> Add post to thread
        </Button>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => copy(fullText)}>
          <Copy /> Copy{isX && posts.length > 1 ? " thread" : ""}
        </Button>
        <Button size="sm" variant="outline" onClick={openComposer} disabled={overLimit}>
          <ExternalLink /> {isX ? "Open in X" : "Copy and open LinkedIn"}
        </Button>
        {dirty && (
          <Button size="sm" variant="secondary" onClick={() => save()} disabled={pending}>
            Save edits
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={status} />
          {status !== "posted" ? (
            <>
              {status !== "skipped" && (
                <Button size="sm" variant="ghost" onClick={() => save("skipped")} disabled={pending}>
                  Skip
                </Button>
              )}
              <Button size="sm" onClick={() => save("posted")} disabled={pending || overLimit}>
                <Check /> Mark posted
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => save("draft")} disabled={pending}>
              Undo
            </Button>
          )}
        </div>
      </div>
      {isX && posts.length > 1 && (
        <p className="text-xs text-muted-foreground">
          &quot;Open in X&quot; starts the thread with post 1. Add the rest as replies in X.
        </p>
      )}
    </div>
  )
}
