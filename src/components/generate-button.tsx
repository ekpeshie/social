"use client"

import { useTransition } from "react"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { generateAction } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function GenerateButton({
  force = false,
  label,
  variant = "default",
}: {
  force?: boolean
  label: string
  variant?: "default" | "outline"
}) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant={variant}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const { error } = await generateAction(force)
          if (error) toast.error(error)
          else toast.success("Today's drafts are ready")
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : force ? <RefreshCw /> : <Sparkles />}
      {pending ? "Writing drafts…" : label}
    </Button>
  )
}
