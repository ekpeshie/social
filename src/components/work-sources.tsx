"use client"

import { useState, useTransition } from "react"
import { AlertCircle, GitBranch, Loader2, PenTool } from "lucide-react"
import { checkWorkAction } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WorkItem } from "@/lib/types"

type Result = { items: WorkItem[]; errors: string[] }

/** Shows what the app can currently read from GitHub and Figma. */
export function WorkCheck({ disabled }: { disabled: boolean }) {
  const [result, setResult] = useState<Result | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={disabled || pending}
        onClick={() => startTransition(async () => setResult(await checkWorkAction()))}
      >
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Checking…" : "Check recent work"}
      </Button>
      {disabled && <p className="text-xs text-muted-foreground">Save your settings first, then check.</p>}

      {result && (
        <div className="flex flex-col gap-3">
          {result.errors.map((e) => (
            <Alert key={e} variant="destructive">
              <AlertCircle />
              <AlertTitle>Couldn&apos;t read a source</AlertTitle>
              <AlertDescription>{e}</AlertDescription>
            </Alert>
          ))}
          {result.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity found. GitHub looks back 7 days and Figma 14 days.
            </p>
          ) : (
            <ul className="flex flex-col divide-y rounded-lg border">
              {result.items.map((item) => (
                <li key={item.url} className="flex flex-col gap-1 p-3">
                  <div className="flex items-center gap-2">
                    {item.source === "github" ? (
                      <GitBranch className="size-4 text-muted-foreground" />
                    ) : (
                      <PenTool className="size-4 text-muted-foreground" />
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 truncate text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </a>
                    <Badge variant="outline" className="ml-auto">
                      {item.details.length} {item.source === "github" ? "changes" : "notes"}
                    </Badge>
                  </div>
                  {item.details.length > 0 && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.details.slice(0, 3).join(" · ")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
