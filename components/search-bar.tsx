"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, CalendarDays, Search, Users } from "lucide-react"
import { useSearch, type SearchCriteria } from "@/lib/search-context"
import { GuestsPicker, type Guests } from "@/components/guests-picker"
import { SearchCalendar } from "@/components/search-calendar"

export function SearchBar() {
  const { setCriteria, criteria: initialCriteria } = useSearch()
  const [destination, setDestination] = useState(initialCriteria.destination)
  const [checkIn, setCheckIn] = useState<string | null>(initialCriteria.checkIn || null)
  const [checkOut, setCheckOut] = useState<string | null>(initialCriteria.checkOut || null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const whenButtonRef = useRef<HTMLButtonElement | null>(null)
  const [guests, setGuests] = useState<Guests>({ adults: Math.max(1, initialCriteria.guests), children: 0, infants: 0, pets: 0, rooms: initialCriteria.rooms })

  function buildCriteria(overrides: Partial<SearchCriteria> = {}): SearchCriteria {
    const totalGuests = guests.adults + guests.children
    const rooms = guests.rooms ?? Math.max(1, Math.ceil(totalGuests / 2))

    return {
      checkIn: checkIn ?? "",
      checkOut: checkOut ?? "",
      destination,
      guests: totalGuests,
      rooms,
      searched: false,
      ...overrides,
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setCriteria(buildCriteria({ searched: true }))
    document.getElementById("stays")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <form
      onSubmit={handleSearch}
      className="rounded-3xl border border-border bg-card/95 p-3 shadow-2xl shadow-primary/10 z-40 backdrop-blur-sm"
    >
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr_auto]">
        <Field icon={<MapPin className="size-4 text-primary" />} label="Where to">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Search destination"
            className="w-full bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </Field>
        <Field icon={<CalendarDays className="size-4 text-primary" />} label="When">
          <div className="w-full relative">
            <button
              type="button"
              ref={(el) => {
                whenButtonRef.current = el
              }}
              onClick={() => {
                const rect = whenButtonRef.current?.getBoundingClientRect() ?? null
                setAnchorRect(rect)
                setCalendarOpen((v) => !v)
              }}
              className="w-full text-left px-3 py-2 rounded-xl bg-accent/10 border border-border/30 text-sm font-semibold text-foreground shadow-sm"
              aria-expanded={calendarOpen}
              aria-label="Select dates"
            >
              <span className="inline-block min-w-0 truncate">
                {checkIn && checkOut
                  ? `${new Date(checkIn).toLocaleDateString()} – ${new Date(checkOut).toLocaleDateString()}`
                  : 'Add dates'}
              </span>
            </button>
            {calendarOpen && (
              <SearchCalendar
                hotelId={undefined}
                initialCheckIn={checkIn ?? undefined}
                initialCheckOut={checkOut ?? undefined}
                anchorEl={whenButtonRef.current}
                onApply={(ci, co) => {
                  const nextCheckIn = ci ?? null
                  const nextCheckOut = co ?? null
                  setCheckIn(nextCheckIn)
                  setCheckOut(nextCheckOut)
                  setCriteria(buildCriteria({
                    checkIn: nextCheckIn ?? "",
                    checkOut: nextCheckOut ?? "",
                    searched: true,
                  }))
                  setCalendarOpen(false)
                }}
                onClose={() => setCalendarOpen(false)}
              />
            )}
          </div>
        </Field>
        <Field icon={<Users className="size-4 text-primary" />} label="Guests">
          <div className="w-full">
            <GuestsPicker value={guests} onChange={(next) => setGuests(next)} />
          </div>
        </Field>
        <div className="flex pt-1 sm:items-stretch sm:p-1.5">
          <Button type="submit" size="lg" className="h-11 w-full gap-2 rounded-xl px-4 text-sm sm:h-full sm:w-auto sm:rounded-2xl sm:px-6">
            <Search className="size-4" />
            Search stays
          </Button>
        </div>
      </div>
    </form>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex cursor-text items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-accent/60">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {children}
      </span>
    </label>
  )
}
