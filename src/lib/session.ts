import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { hasProfile } from "./store"

// No sign-up: each browser gets a random id when it finishes onboarding.
export const USER_COOKIE = "uid"

export async function currentUserId(): Promise<string | null> {
  const id = (await cookies()).get(USER_COOKIE)?.value
  return id && /^[0-9a-f-]{36}$/.test(id) ? id : null
}

/** The signed-in browser's id; sends anyone without a profile to onboarding. */
export async function requireUserId(): Promise<string> {
  const id = await currentUserId()
  if (!id || !(await hasProfile(id))) redirect("/onboarding")
  return id
}

export async function setUserCookie(id: string) {
  ;(await cookies()).set(USER_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 400,
    path: "/",
  })
}
