"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Building2, LogOut, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type Hotel = {
  id: string
  name: string
  slug: string
  area: string
  description: string
  category: string
  price: number
  maxGuests: number
  ownerName: string
  ownerContact: string
  status: "draft" | "published" | "archived"
  ownerUserId: string | null
}

type FormState = Omit<Hotel, "id" | "ownerUserId" | "status"> & {
  ownerUsername: string
  ownerPassword: string
  status: Hotel["status"]
}

const emptyForm: FormState = {
  name: "", slug: "", area: "Tiruchendur", description: "", category: "Hotel", price: 0,
  maxGuests: 2, ownerName: "", ownerContact: "", ownerUsername: "", ownerPassword: "", status: "draft",
}

async function readJson<T>(response: Response) {
  return response.json().catch(() => ({})) as Promise<T>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function loadHotels() {
    setLoading(true)
    setError("")
    const response = await fetch("/api/portal/admin/hotels", { cache: "no-store" })
    const data = await readJson<{ hotels?: Hotel[]; error?: string }>(response)
    if (response.status === 401) {
      router.replace("/admin")
      return
    }
    if (!response.ok) setError(data.error || "Could not load properties.")
    else setHotels(data.hotels || [])
    setLoading(false)
  }

  useEffect(() => { void loadHotels() }, [])

  function updateForm(field: keyof FormState, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function createHotel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")
    const response = await fetch("/api/portal/admin/hotels", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    })
    const data = await readJson<{ hotel?: Hotel; error?: string }>(response)
    if (response.status === 401) {
      router.replace("/admin")
      return
    }
    if (!response.ok) setError(data.error || "Could not create the property.")
    else {
      setHotels((current) => [data.hotel as Hotel, ...current])
      setForm(emptyForm)
      setShowForm(false)
      setMessage("Property created successfully.")
    }
    setSaving(false)
  }

  async function logout() {
    await fetch("/api/portal/auth/logout", { method: "POST" })
    router.replace("/admin")
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tiruchendur Stays</p><h1 className="mt-1 font-serif text-2xl font-semibold">Admin dashboard</h1></div>
          <Button variant="outline" onClick={logout}><LogOut /> Sign out</Button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-muted-foreground">Manage the properties shown on the booking site.</p><h2 className="mt-1 text-xl font-semibold">Properties <span className="text-muted-foreground">({hotels.length})</span></h2></div><div className="flex gap-2"><Button variant="outline" onClick={() => void loadHotels()} disabled={loading}><RefreshCw /> Refresh</Button><Button onClick={() => { setShowForm((current) => !current); setError("") }}><Plus /> Add property</Button></div></div>
        {message && <p className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">{message}</p>}
        {error && <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        {showForm && <form onSubmit={createHotel} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold">Add a property</h3><p className="mt-1 text-sm text-muted-foreground">Create the listing and its owner login together.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Property name" value={form.name} onChange={(value) => updateForm("name", value)} required /><Field label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} placeholder="leave blank to use property name" /><Field label="Area" value={form.area} onChange={(value) => updateForm("area", value)} required /><Field label="Category" value={form.category} onChange={(value) => updateForm("category", value)} required /><Field label="Starting price (INR)" type="number" min="0" value={form.price} onChange={(value) => updateForm("price", Number(value))} required /><Field label="Maximum guests" type="number" min="1" value={form.maxGuests} onChange={(value) => updateForm("maxGuests", Number(value))} required /><Field label="Owner name" value={form.ownerName} onChange={(value) => updateForm("ownerName", value)} required /><Field label="Owner contact" value={form.ownerContact} onChange={(value) => updateForm("ownerContact", value)} required /><Field label="Owner username" value={form.ownerUsername} onChange={(value) => updateForm("ownerUsername", value)} required /><Field label="Owner password" type="password" minLength={12} value={form.ownerPassword} onChange={(value) => updateForm("ownerPassword", value)} required /><label className="block text-sm font-medium">Listing status<select value={form.status} onChange={(event) => updateForm("status", event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3"><option value="draft">Draft</option><option value="published">Published</option></select></label><label className="block text-sm font-medium sm:col-span-2">Description<textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2" /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create property"}</Button></div></form>}
        <section className="mt-6 grid gap-3">{loading ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading properties...</p> : hotels.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><Building2 className="mx-auto size-8 text-primary" /><h3 className="mt-3 font-semibold">No properties yet</h3><p className="mt-1 text-sm text-muted-foreground">Create the first listing to give an owner access.</p></div> : hotels.map((hotel) => <article key={hotel.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{hotel.name}</h3><span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">{hotel.status}</span></div><p className="mt-1 text-sm text-muted-foreground">{hotel.area} · {hotel.category} · From ₹{hotel.price.toLocaleString("en-IN")}</p><p className="mt-2 text-sm">Owner: {hotel.ownerName} {hotel.ownerUserId ? <span className="text-muted-foreground">(login created)</span> : <span className="text-muted-foreground">(no login)</span>}</p></div><Link href={`/properties/${hotel.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">View listing <ArrowRight className="size-4" /></Link></article>)}</section>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, type = "text", ...props }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; [key: string]: unknown }) {
  return <label className="block text-sm font-medium">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" {...props} /></label>
}
