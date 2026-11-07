"use client"

import { useState, useTransition } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { onboardAction } from "@/app/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type ProfessionOption = { id: string; label: string; description: string }

const STEPS = ["Your profession", "Posts per day", "Your accounts"] as const

export function Onboarding({ professions }: { professions: ProfessionOption[] }) {
  const [step, setStep] = useState(0)
  const [profession, setProfession] = useState("")
  const [otherRole, setOtherRole] = useState("")
  const [ideasPerDay, setIdeasPerDay] = useState("2")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [xHandle, setXHandle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const canContinue = step !== 0 || (profession && (profession !== "other" || otherRole.trim()))

  function finish(skipAccounts: boolean) {
    setError(null)
    startTransition(async () => {
      const res = await onboardAction({
        profession,
        otherRole,
        ideasPerDay: Number(ideasPerDay),
        linkedinUrl: skipAccounts ? "" : linkedinUrl,
        xHandle: skipAccounts ? "" : xHandle,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      // On success the action redirects, so only errors come back.
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 py-4 sm:py-10">
      <div className="flex flex-col gap-4">
        <p className="font-semibold tracking-tight">Daily Posts</p>
        <ol className="flex gap-2" aria-label="Setup progress">
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={cn("h-1 flex-1 rounded-full bg-muted", i <= step && "bg-primary")}
            >
              <span className="sr-only">
                {label}
                {i < step ? " (done)" : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {step === 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">What do you do?</h1>
            <p className="text-muted-foreground">Your post ideas are written for your field. You can fine-tune this later.</p>
          </div>
          <RadioGroup value={profession} onValueChange={setProfession} className="grid gap-3 sm:grid-cols-2">
            {[...professions, { id: "other", label: "Something else", description: "Tell us your role" }].map((p) => (
              <Label
                key={p.id}
                htmlFor={`profession-${p.id}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                  profession === p.id && "border-primary bg-accent/50",
                )}
              >
                <RadioGroupItem id={`profession-${p.id}`} value={p.id} className="mt-0.5" />
                <span className="flex flex-col gap-1">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-sm font-normal text-muted-foreground">{p.description}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
          {profession === "other" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="otherRole">Your role</Label>
              <Input
                id="otherRole"
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
                placeholder="e.g. Brand designer, Recruiter, Architect"
                autoFocus
              />
            </div>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">How many posts a day?</h1>
            <p className="text-muted-foreground">
              Each idea comes with a LinkedIn draft and an X draft. Posting once or twice a day is plenty for most people.
            </p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="lg"
            value={ideasPerDay}
            onValueChange={(v) => v && setIdeasPerDay(v)}
            aria-label="Post ideas per day"
            className="w-full"
          >
            {["1", "2", "3", "4", "5"].map((n) => (
              <ToggleGroupItem key={n} value={n} className="flex-1 tabular-nums" aria-label={`${n} per day`}>
                {n}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-sm text-muted-foreground">
            {ideasPerDay} {ideasPerDay === "1" ? "idea" : "ideas"} a day, ready every morning. Change it anytime in
            Settings.
          </p>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Add your accounts</h1>
            <p className="text-muted-foreground">
              Optional. We use these to find posts you could reply to and replies to your posts. We never log in or post
              for you.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="linkedinUrl">LinkedIn profile</Label>
            <Input
              id="linkedinUrl"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="linkedin.com/in/your-name"
              autoComplete="url"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="xHandle">X handle</Label>
            <Input id="xHandle" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@yourhandle" />
          </div>
        </section>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={pending}>
            <ArrowLeft /> Back
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => finish(true)} disabled={pending}>
              Skip for now
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canContinue}>
              Continue
            </Button>
          ) : (
            <Button onClick={() => finish(false)} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Get my posts
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
