import { ProfileForm } from "@/components/profile-form"
import { requireUserId } from "@/lib/session"
import { getProfile } from "@/lib/store"
import { hasWorkSources } from "@/lib/work"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const profile = await getProfile(await requireUserId())
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Tell the writer who you are. Every draft is written from this.</p>
      </div>
      <ProfileForm
        profile={profile}
        hasSources={hasWorkSources(profile)}
        tokens={{ github: Boolean(process.env.GITHUB_TOKEN), figma: Boolean(process.env.FIGMA_TOKEN) }}
      />
    </div>
  )
}
