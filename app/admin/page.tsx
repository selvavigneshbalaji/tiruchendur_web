"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/portal/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ user?: { role?: string } }> : null)
      .then((data) => {
        if (data?.user?.role === "admin") router.replace("/admin/dashboard")
        if (data?.user?.role === "owner") router.replace("/owner")
      })
      .catch(() => undefined)
  }, [router])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/portal/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) })
      const data = await response.json().catch(() => ({})) as { error?: string; user?: { role: "admin" | "owner" } }
      if (!response.ok || !data.user) throw new Error(data.error || "Could not sign in.")
      router.replace(data.user.role === "admin" ? "/admin/dashboard" : "/owner")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Tiruchendur Stays</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">Portal sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">For administrators and hotel owners.</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-foreground">Username
            <input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-medium text-foreground">Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
          </label>
        </div>
        {error && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</Button>
        <Link href="/admin/setup" className="mt-4 block text-center text-sm font-medium text-primary hover:underline">First-time admin setup</Link>
      </form>
    </main>
  )
}
