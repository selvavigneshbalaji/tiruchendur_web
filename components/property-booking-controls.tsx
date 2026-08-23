"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Phone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuestsPicker, type Guests } from "@/components/guests-picker"
import { SearchCalendar } from "@/components/search-calendar"
import { getDisplayPrice, getPriceForDateRange, type Hotel } from "@/lib/hotels"

export function PropertyBookingControls({ hotel, initialCheckIn = "", initialCheckOut = "", initialGuests = 1 }: { hotel: Hotel; initialCheckIn?: string; initialCheckOut?: string; initialGuests?: number }) {
  const router = useRouter()
  const dateButtonRef = useRef<HTMLButtonElement | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState<Guests>({ adults: Math.min(Math.max(1, initialGuests), hotel.maxGuests), children: 0, infants: 0, pets: 0, rooms: 1 })

  useEffect(() => {
    setCheckIn(initialCheckIn)
    setCheckOut(initialCheckOut)
    setGuests((current) => ({ ...current, adults: Math.min(Math.max(1, initialGuests), hotel.maxGuests), children: 0 }))
  }, [hotel.maxGuests, initialCheckIn, initialCheckOut, initialGuests])

  const guestCount = guests.adults + guests.children
  const perNightPrice = useMemo(() => getDisplayPrice(hotel, checkIn, guestCount), [checkIn, guestCount, hotel])
  const totalPrice = useMemo(() => checkIn && checkOut ? getPriceForDateRange(hotel, checkIn, checkOut, guestCount) : perNightPrice, [checkIn, checkOut, guestCount, hotel, perNightPrice])
  const phoneNumber = hotel.ownerContact.replace(/[^+\d]/g, "")

  function updateUrl(nextCheckIn: string, nextCheckOut: string, nextGuests: number) {
    const params = new URLSearchParams()
    if (nextCheckIn) params.set("checkIn", nextCheckIn)
    if (nextCheckOut) params.set("checkOut", nextCheckOut)
    params.set("guests", String(nextGuests))
    router.replace(`/properties/${hotel.id}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{checkIn && checkOut ? "Stay total" : "From"}</div>
          <div className="mt-1 text-2xl font-bold text-foreground" data-testid="property-price">₹{totalPrice.toLocaleString("en-IN")}</div>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{checkIn && checkOut ? "selected dates" : "per night"}</div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button ref={dateButtonRef} type="button" className="gap-2" onClick={() => setCalendarOpen(true)}>
          <CalendarDays className="size-4" />
          {checkIn && checkOut ? "Change dates" : "Check dates"}
        </Button>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1">
          <Users className="size-4 shrink-0 text-primary" />
          <GuestsPicker
            value={guests}
            maxGuests={hotel.maxGuests}
            onChange={(next) => {
              setGuests(next)
              updateUrl(checkIn, checkOut, next.adults + next.children)
            }}
          />
        </div>
      </div>

      <a href={phoneNumber ? `tel:${phoneNumber}` : undefined} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent" aria-disabled={!phoneNumber}>
        <Phone className="size-4" />
        Call host
      </a>

      {calendarOpen && <SearchCalendar hotelId={hotel.id} hotel={hotel} initialCheckIn={checkIn} initialCheckOut={checkOut} anchorEl={dateButtonRef.current} onClose={() => setCalendarOpen(false)} onApply={(nextCheckIn, nextCheckOut) => {
        const ci = nextCheckIn ?? ""
        const co = nextCheckOut ?? ""
        setCheckIn(ci)
        setCheckOut(co)
        updateUrl(ci, co, guestCount)
        setCalendarOpen(false)
      }} />}
    </div>
  )
}
