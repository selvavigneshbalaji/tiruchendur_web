"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X, Star } from "lucide-react"
import { getBookedDates, type Hotel } from "@/lib/hotels"
import { Button } from "@/components/ui/button"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

type DateKey = { y: number; m: number; d: number }

function keyOf({ y, m, d }: DateKey) {
  return y * 10000 + m * 100 + d
}

function startOfToday(): DateKey {
  const n = new Date()
  return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }
}

export function AvailabilityCalendar({
  hotel,
  onClose,
}: {
  hotel: Hotel
  onClose: () => void
}) {
  const today = startOfToday()
  const [view, setView] = useState({ y: today.y, m: today.m })
  const [checkIn, setCheckIn] = useState<DateKey | null>(null)
  const [checkOut, setCheckOut] = useState<DateKey | null>(null)

  const booked = useMemo(
    () => getBookedDates(hotel.id, view.y, view.m),
    [hotel.id, view.y, view.m],
  )

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const todayKey = keyOf(today)

  const canGoPrev = view.y > today.y || (view.y === today.y && view.m > today.m)

  function shiftMonth(dir: number) {
    setView((v) => {
      const next = new Date(v.y, v.m + dir, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })
  }

  function handleSelect(day: number) {
    const picked: DateKey = { y: view.y, m: view.m, d: day }
    const pk = keyOf(picked)
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(picked)
      setCheckOut(null)
      return
    }
    if (pk <= keyOf(checkIn)) {
      setCheckIn(picked)
      return
    }
    setCheckOut(picked)
  }

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const a = new Date(checkIn.y, checkIn.m, checkIn.d)
    const b = new Date(checkOut.y, checkOut.m, checkOut.d)
    return Math.round((b.getTime() - a.getTime()) / 86400000)
  }, [checkIn, checkOut])

  const total = nights * hotel.price

  function dayState(day: number) {
    const k = keyOf({ y: view.y, m: view.m, d: day })
    const isPast = k < todayKey
    const isBooked = booked.has(day)
    const isCheckIn = checkIn && k === keyOf(checkIn)
    const isCheckOut = checkOut && k === keyOf(checkOut)
    const inRange = checkIn && checkOut && k > keyOf(checkIn) && k < keyOf(checkOut)
    return { isPast, isBooked, isCheckIn, isCheckOut, inRange }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Availability for ${hotel.name}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
                {hotel.name}
              </h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">New calendar</span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-3.5 fill-primary text-primary" />
              {hotel.rating} · {hotel.distance}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close availability calendar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-full bg-card/60 p-1">
              <button
                onClick={() => shiftMonth(-1)}
                disabled={!canGoPrev}
                aria-label="Previous month"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft className="size-5" />
              </button>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">Dates</div>
                <div className="font-serif text-lg font-semibold text-foreground">{MONTHS[view.m]} {view.y}</div>
              </div>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto p-6">
            <div className="flex-1 min-w-[320px]">
              <div className="mt-6 grid grid-cols-7 gap-3 text-center">
                {WEEKDAYS.map((w, i) => (
                  <div
                    key={i}
                    className="py-2 text-xs font-semibold uppercase text-muted-foreground"
                  >
                    {w}
                  </div>
                ))}
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const { isPast, isBooked, isCheckIn, isCheckOut, inRange } = dayState(day)
                  const disabled = isPast || isBooked
                  const isEdge = isCheckIn || isCheckOut

                  return (
                    <button
                      key={day}
                      disabled={disabled}
                      onClick={() => handleSelect(day)}
                      aria-label={`${day} ${MONTHS[view.m]}${isBooked ? " — booked" : ""}`}
                      className={
                        `relative flex aspect-square items-center justify-center rounded-md text-sm font-medium transition-colors ` +
                        (isEdge
                          ? "bg-primary text-primary-foreground"
                          : inRange
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground") +
                        (isBooked ? " cursor-not-allowed text-muted-foreground/40 line-through" : "") +
                        (isPast ? " cursor-not-allowed text-muted-foreground/30" : "")
                      }
                    >
                      <span className="pointer-events-none">{day}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="w-80 shrink-0 rounded-2xl border border-border bg-card p-4">
              <div className="text-sm font-semibold text-foreground">Your selection</div>
              <div className="mt-3 text-xs text-muted-foreground">
                {checkIn && checkOut ? (
                  <>
                    <div>
                      <strong>Check in:</strong> {checkIn.y}-{checkIn.m + 1}-{checkIn.d}
                    </div>
                    <div>
                      <strong>Check out:</strong> {checkOut.y}-{checkOut.m + 1}-{checkOut.d}
                    </div>
                    <div className="mt-2">{nights} nights · ₹{total.toLocaleString("en-IN")}</div>
                  </>
                ) : (
                  <div>No dates selected</div>
                )}
              </div>
              <div className="mt-4">
                <Button onClick={onClose} className="w-full">Close</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
