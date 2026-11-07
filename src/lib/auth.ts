export const SESSION_COOKIE = "session"

/** Cookie value: a SHA-256 of the app password, so the password itself is never stored client-side. */
export async function sessionToken(password: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`daily-posts:${password}`))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("")
}
