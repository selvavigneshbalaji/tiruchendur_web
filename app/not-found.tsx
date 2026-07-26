import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SearchX className="size-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
          We couldn&apos;t find that stay
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This page may have moved or the property link may be incorrect. Explore our available stays near Tiruchendur Temple.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          Back to stays
        </Link>
      </div>
    </main>
  )
}
