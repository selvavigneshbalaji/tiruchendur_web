"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Users, X } from "lucide-react"
import { categories, isAvailableForRange, matchesDestination, type Hotel } from "@/lib/hotels"
import { HotelCard } from "@/components/hotel-card"
import { useSearch } from "@/lib/search-context"
import { formatDateForDisplay } from "@/lib/utils"

export function StaysSection({ initialHotels }: { initialHotels: Hotel[] }) {
  const { criteria, setCriteria } = useSearch()
  const [active, setActive] = useState<string>("All stays")
  // Use SSR initial data for first render (avoids flash of empty state).
  // SSR has access to APPS_SCRIPT_URL env var, so initialHotels contains
  // the real data from Google Sheets via Apps Script.
  // Client-side refreshes call the /api/hotels endpoint (server-side proxy)
  // to avoid env var unavailability on the client.
  const [hotels, setHotels] = useState<Hotel[]>(() => (Array.isArray(initialHotels) ? initialHotels : []))

  useEffect(() => {
    let isMounted = true

    const refreshHotels = async () => {
      try {
        const res = await fetch('/api/hotels')
        if (!res.ok) return
        const freshHotels: Hotel[] = await res.json()
        if (isMounted) {
          setHotels(Array.isArray(freshHotels) ? freshHotels : [])
        }
      } catch {
        // ignore refresh failures and keep the existing data visible
      }
    }

    refreshHotels()
    const intervalId = window.setInterval(refreshHotels, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  // Step 1: apply the search criteria (dates + guests) when a search has run.
  const searchMatched = useMemo(() => {
    const safeHotels = Array.isArray(hotels) ? hotels : []
    if (!criteria.searched) return safeHotels

    const searchText = criteria.destination.trim().toLowerCase()

    return safeHotels.filter((h) => {
      const destinationMatches = matchesDestination(h, searchText)
      const roomMatches = criteria.rooms <= 1 || h.maxGuests >= criteria.rooms * 2
      const guestMatches = h.maxGuests >= criteria.guests
      const dateMatches = isAvailableForRange(h.id, criteria.checkIn, criteria.checkOut, h)

      return destinationMatches && roomMatches && guestMatches && dateMatches
    })
  }, [criteria.checkIn, criteria.checkOut, criteria.destination, criteria.guests, criteria.rooms, criteria.searched, hotels])

  // Step 2: apply the category chips on top of the search results.
  const filtered = useMemo(() => {
    const safeSearchMatched = Array.isArray(searchMatched) ? searchMatched : []
    if (active === "All stays") return safeSearchMatched
    if (active === "Near Temple")
      return safeSearchMatched.filter((h) => h.distance.includes("m "))
    if (active === "Sea view")
      return safeSearchMatched.filter((h) => h.tags.some((t) => t.toLowerCase().includes("sea")))
    return safeSearchMatched.filter((h) => h.category === active)
  }, [active, searchMatched])

  const checkIn = formatDateForDisplay(criteria.checkIn, false)
  const checkOut = formatDateForDisplay(criteria.checkOut, false)

  function clearSearch() {
    setCriteria({ checkIn: "", checkOut: "", destination: "Tiruchendur, Tamil Nadu", guests: 2, rooms: 1, searched: false })
    setActive("All stays")
  }

  return (
    <section id="stays" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          {criteria.searched ? "Search results" : "Featured stays"}
        </span>
        <h2 className="text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          {criteria.searched
            ? `${searchMatched.length} ${searchMatched.length === 1 ? "stay" : "stays"} available in Tiruchendur`
            : "Where pilgrims rest in Tiruchendur"}
        </h2>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Every stay is verified for cleanliness, location and value — so you can
          focus on your darshan, not your booking.
        </p>
      </div>

      {criteria.searched && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-accent/40 px-4 py-3">
          {checkIn && checkOut && (
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="size-4 text-primary" />
              {checkIn} – {checkOut}
            </span>
          )}
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="size-4 text-primary" />
            {criteria.guests} {criteria.guests === 1 ? "guest" : "guests"} · {criteria.rooms}{" "}
            {criteria.rooms === 1 ? "room" : "rooms"}
          </span>
          <button
            onClick={clearSearch}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary"
          >
            <X className="size-3.5" />
            Clear search
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(filtered ?? []).map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-muted-foreground">
            {criteria.searched
              ? "No stays are available for these dates and guests. Try adjusting your dates or party size."
              : "No stays match this filter yet. Try another category."}
          </p>
          {criteria.searched && (
            <button
              onClick={clearSearch}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reset search
            </button>
          )}
        </div>
      )}
    </section>
  )
}
