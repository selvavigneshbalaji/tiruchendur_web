"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminSetupPage() {
  const [bootstrapToken, setBootstrapToken] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function setup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage("")
    try {
      const response = await fetch("/api/portal/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Bootstrap-Token": bootstrapToken },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(data.error || "Could not create the admin account.")
      setBootstrapToken("")
      setPassword("")
      setMessage("Admin account created. Delete the bootstrap secret in Cloudflare, then sign in.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the admin account.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <form onSubmit={setup} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Tiruchendur Stays</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">Create admin account</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use this page once, after setting <code>BOOTSTRAP_TOKEN</code> in Cloudflare. Do not share that token.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-foreground">Bootstrap token
            <input required type="password" value={bootstrapToken} onChange={(event) => setBootstrapToken(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-medium text-foreground">Admin username
            <input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-medium text-foreground">Admin password
            <input required minLength={12} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" />
          </label>
        </div>

        {message && <p className="mt-4 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">{message}</p>}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>{submitting ? "Creating account…" : "Create admin account"}</Button>
        <Link href="/admin" className="mt-4 block text-center text-sm font-medium text-primary hover:underline">Go to admin sign in</Link>
      </form>
    </main>
  )
}
