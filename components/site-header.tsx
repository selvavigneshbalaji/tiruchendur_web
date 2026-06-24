"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, Sparkles } from "lucide-react"

const navLinks = [
  { label: "Stays", href: "#stays" },
  { label: "Temple Guide", href: "#temple" },
  { label: "Why us", href: "#why" },
  { label: "Reviews", href: "#reviews" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="font-serif text-lg font-semibold leading-none tracking-tight">
            Tiruchendur
            <span className="block text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Stays
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="lg"
            nativeButton={false}
            render={<a href="tel:+910000000000" />}
          >
            <Phone className="size-4" />
            Helpline
          </Button>
          <Button size="lg">Sign in</Button>
        </div>

        <button
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Button variant="outline" size="lg" className="flex-1">
                Helpline
              </Button>
              <Button size="lg" className="flex-1">
                Sign in
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
