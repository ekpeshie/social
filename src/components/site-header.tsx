"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const links = [
  { href: "/", label: "Today" },
  { href: "/replies", label: "Replies" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
]

export function SiteHeader() {
  const pathname = usePathname()
  if (pathname === "/login" || pathname === "/onboarding") return null
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-6 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Daily Posts
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground",
                pathname === l.href && "font-medium text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
