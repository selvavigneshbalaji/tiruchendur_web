"use client"

import { FormEvent, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ImagePlus, LogOut, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Room = { id: string; hotelId: string; name: string; description: string; maxGuests: number; basePrice: number; status: "active" | "inactive" }
type ImageItem = { id: string; url: string; altText: string }
type Hotel = { id: string; name: string }

async function readJson<T>(response: Response) { return response.json().catch(() => ({})) as Promise<T> }

export function PortalRooms({ admin = false }: { admin?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelId, setHotelId] = useState(searchParams.get("hotelId") || "")
  const [rooms, setRooms] = useState<Room[]>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [room, setRoom] = useState({ name: "", description: "", maxGuests: 2, basePrice: 0 })
  const [price, setPrice] = useState({ roomId: "", date: "", value: 0, available: true })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const prefix = admin ? "/admin" : "/owner"

  async function load() {
    setLoading(true); setError("")
    if (admin && !hotels.length) {
      const hotelResponse = await fetch("/api/portal/admin/hotels", { cache: "no-store" })
      const hotelData = await readJson<{ hotels?: Hotel[]; error?: string }>(hotelResponse)
      if (hotelResponse.status === 401) return router.replace("/admin")
      if (!hotelResponse.ok) { setError(hotelData.error || "Could not load properties."); setLoading(false); return }
      setHotels(hotelData.hotels || [])
      if (!hotelId && hotelData.hotels?.[0]) setHotelId(hotelData.hotels[0].id)
    }
    if (!hotelId && admin) { setLoading(false); return }
    const query = admin ? `?hotelId=${encodeURIComponent(hotelId)}` : ""
    const [roomResponse, imageResponse] = await Promise.all([fetch(`/api/portal${prefix}/rooms${query}`, { cache: "no-store" }), fetch(`/api/portal${prefix}/images${query}`, { cache: "no-store" })])
    const roomData = await readJson<{ rooms?: Room[]; error?: string }>(roomResponse)
    const imageData = await readJson<{ images?: ImageItem[]; error?: string }>(imageResponse)
    if (roomResponse.status === 401) return router.replace("/admin")
    if (!roomResponse.ok) setError(roomData.error || "Could not load rooms.")
    else setRooms(roomData.rooms || [])
    if (imageResponse.ok) setImages(imageData.images || [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [hotelId])

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("")
    const response = await fetch(`/api/portal${prefix}/rooms`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...room, ...(admin ? { hotelId } : {}) }) })
    const data = await readJson<{ room?: Room; error?: string }>(response)
    if (!response.ok) setError(data.error || "Could not create room.")
    else { setRooms((current) => [data.room as Room, ...current]); setRoom({ name: "", description: "", maxGuests: 2, basePrice: 0 }); setMessage("Room created.") }
  }

  async function savePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("")
    const response = await fetch(`/api/portal${prefix}/rooms/${price.roomId}/prices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: price.date, price: price.value, available: price.available }) })
    const data = await readJson<{ error?: string }>(response)
    if (!response.ok) setError(data.error || "Could not save date price.")
    else setMessage("Date price and availability saved.")
  }

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!file) return setError("Choose an image first.")
    const form = new FormData(); form.append("file", file); if (admin) form.append("hotelId", hotelId)
    const response = await fetch(`/api/portal${prefix}/images`, { method: "POST", body: form })
    const data = await readJson<{ image?: ImageItem; error?: string }>(response)
    if (!response.ok) setError(data.error || "Could not upload image.")
    else { setImages((current) => [...current, data.image as ImageItem]); setFile(null); setMessage("Image uploaded.") }
  }

  async function deleteImage(id: string) {
    const response = await fetch(`/api/portal${prefix}/images/${id}`, { method: "DELETE" })
    if (response.ok) setImages((current) => current.filter((image) => image.id !== id))
  }

  async function logout() { await fetch("/api/portal/auth/logout", { method: "POST" }); router.replace("/admin") }

  return <main className="min-h-screen bg-background"><header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tiruchendur Stays</p><h1 className="mt-1 font-serif text-2xl font-semibold">{admin ? "Room and photo management" : "Rooms and photos"}</h1></div><Button variant="outline" onClick={logout}><LogOut /> Sign out</Button></div></header><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{admin && <label className="block max-w-md text-sm font-medium">Property<select value={hotelId} onChange={(event) => setHotelId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3">{hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}</select></label>}{message && <p className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">{message}</p>}{error && <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]"><form onSubmit={createRoom} className="rounded-2xl border border-border bg-card p-5"><h2 className="text-lg font-semibold">Add room</h2><div className="mt-4 grid gap-3"><Field label="Room name" value={room.name} onChange={(value) => setRoom({ ...room, name: value })} required /><Field label="Base price (INR)" type="number" min="0" value={room.basePrice} onChange={(value) => setRoom({ ...room, basePrice: Number(value) })} required /><Field label="Maximum guests" type="number" min="1" value={room.maxGuests} onChange={(value) => setRoom({ ...room, maxGuests: Number(value) })} required /><label className="text-sm font-medium">Description<textarea value={room.description} onChange={(event) => setRoom({ ...room, description: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2" /></label></div><Button className="mt-4"><Plus /> Add room</Button></form><form onSubmit={uploadImage} className="rounded-2xl border border-border bg-card p-5"><h2 className="text-lg font-semibold">Property photos</h2><p className="mt-1 text-sm text-muted-foreground">Images are stored securely in Cloudflare R2. Maximum 10 MB.</p><input className="mt-5 block w-full text-sm" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /><Button className="mt-4" type="submit"><ImagePlus /> Upload photo</Button><div className="mt-5 grid grid-cols-3 gap-3">{images.map((image) => <div key={image.id} className="relative"><img src={image.url} alt={image.altText} className="aspect-square w-full rounded-xl object-cover" /><button type="button" aria-label="Delete photo" onClick={() => void deleteImage(image.id)} className="absolute right-1 top-1 rounded-lg bg-black/70 p-1.5 text-white"><Trash2 className="size-4" /></button></div>)}</div></form></div><section className="mt-6 rounded-2xl border border-border bg-card p-5"><h2 className="text-lg font-semibold">Rooms</h2>{loading ? <p className="mt-4 text-sm text-muted-foreground">Loading rooms...</p> : rooms.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No rooms created yet.</p> : <div className="mt-4 grid gap-4 sm:grid-cols-2">{rooms.map((item) => <article key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">Up to {item.maxGuests} guests · ₹{item.basePrice.toLocaleString("en-IN")} base price</p></div><span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">{item.status}</span></div><p className="mt-2 text-sm text-muted-foreground">{item.description || "No description"}</p><form onSubmit={(event) => { setPrice({ ...price, roomId: item.id }); void savePrice(event) }} className="mt-4 border-t border-border pt-4"><p className="text-sm font-medium">Date-specific price and availability</p><div className="mt-2 grid grid-cols-2 gap-2"><input required type="date" value={price.roomId === item.id ? price.date : ""} onChange={(event) => setPrice({ ...price, roomId: item.id, date: event.target.value })} className="h-10 rounded-lg border border-input bg-background px-2 text-sm" /><input required type="number" min="0" placeholder="Price" value={price.roomId === item.id ? price.value : ""} onChange={(event) => setPrice({ ...price, roomId: item.id, value: Number(event.target.value) })} className="h-10 rounded-lg border border-input bg-background px-2 text-sm" /></div><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={price.roomId === item.id ? price.available : true} onChange={(event) => setPrice({ ...price, roomId: item.id, available: event.target.checked })} /> Available</label><Button size="sm" className="mt-3"><Save /> Save date</Button></form></article>)}</div>}</section></div></main>
}

function Field({ label, value, onChange, type = "text", ...props }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; [key: string]: unknown }) { return <label className="block text-sm font-medium">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary" {...props} /></label> }
