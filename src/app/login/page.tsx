"use client"

import { useActionState } from "react"
import { loginAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, {})
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <form action={action} className="flex flex-col gap-6">
          <CardHeader>
            <CardTitle>Daily Posts</CardTitle>
            <CardDescription>Enter your password to see today&apos;s drafts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoFocus required aria-invalid={!!state.error} />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Checking…" : "Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
