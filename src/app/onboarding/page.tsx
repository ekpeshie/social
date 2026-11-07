import { redirect } from "next/navigation"
import { Onboarding } from "@/components/onboarding"
import { currentUserId } from "@/lib/session"
import { hasProfile } from "@/lib/store"
import { professions } from "@/lib/professions"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const uid = await currentUserId()
  if (uid && (await hasProfile(uid))) redirect("/")
  return (
    <Onboarding
      professions={professions.map(({ id, label, description }) => ({ id, label, description }))}
    />
  )
}
