"use client"

import { useMemo, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getBookedDates } from "@/lib/hotels"

type DateKey = { y: number; m: number; d: number }

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function keyOf({ y, m, d }: DateKey) {
  return y * 10000 + m * 100 + d
}

function isoFromKey(k: DateKey) {
  const mm = String(k.m + 1).padStart(2, "0")
  const dd = String(k.d).padStart(2, "0")
  return `${k.y}-${mm}-${dd}`
}

function keyFromIso(iso: string | null): DateKey | null {
  if (!iso) return null
  const parts = iso.split("-")
  if (parts.length < 3) return null
  return { y: Number(parts[0]), m: Number(parts[1]) - 1, d: Number(parts[2]) }
}

export function SearchCalendar({
  hotelId,
  initialCheckIn,
  initialCheckOut,
  onApply,
  onClose,
  anchorEl,
}: {
  hotelId?: string
  initialCheckIn?: string | null
  initialCheckOut?: string | null
  onApply: (checkIn: string | null, checkOut: string | null) => void
  onClose: () => void
  anchorEl?: HTMLElement | null
}) {
  const today = new Date()
  const start = keyFromIso(initialCheckIn ?? null) ?? { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() }
  const [view, setView] = useState({ y: start.y, m: start.m })
  const [checkIn, setCheckIn] = useState<DateKey | null>(keyFromIso(initialCheckIn ?? null))
  const [checkOut, setCheckOut] = useState<DateKey | null>(keyFromIso(initialCheckOut ?? null))
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null)
  const [openTimePicker, setOpenTimePicker] = useState<'in' | 'out' | null>(null)

  const booked = useMemo(() => {
    if (!hotelId) return new Set<number>()
    return getBookedDates(hotelId, view.y, view.m)
  }, [hotelId, view.y, view.m])

  const todayKey = keyOf({ y: today.getFullYear(), m: today.getMonth(), d: today.getDate() })

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const nextView = { y: view.m === 11 ? view.y + 1 : view.y, m: (view.m + 1) % 12 }

  const bookedNext = useMemo(() => {
    if (!hotelId) return new Set<number>()
    return getBookedDates(hotelId, nextView.y, nextView.m)
  }, [hotelId, nextView.y, nextView.m])

  function shiftMonth(dir: number) {
    setView((v) => {
      const next = new Date(v.y, v.m + dir, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })
  }

  function shiftBothMonths(dir: number) {
    setView((v) => {
      const next = new Date(v.y, v.m + dir, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })
  }

  function handleSelect(day: number, year = view.y, month = view.m) {
    const picked: DateKey = { y: year, m: month, d: day }
    const pk = keyOf(picked)
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(picked)
      setCheckOut(null)
      setCheckInTime('15:00')
      setOpenTimePicker('in')
      return
    }
    const ck = keyOf(checkIn)
    if (pk < ck) {
      setCheckIn(picked)
      setCheckInTime('15:00')
      setOpenTimePicker('in')
      return
    }
    if (pk === ck) {
      // allow same-day checkout
      setCheckOut(picked)
      // default same-day window
      setCheckOutTime('18:00')
      setOpenTimePicker('out')
      return
    }
    setCheckOut(picked)
    setCheckOutTime('11:00')
    setOpenTimePicker('out')
  }

  function apply() {
    onApply(isoWithTime(checkIn, checkInTime), isoWithTime(checkOut, checkOutTime))
    onClose()
  }

  function isoWithTime(k: DateKey | null, time: string | null) {
    if (!k) return null
    const base = isoFromKey(k)
    return time ? `${base}T${time}` : base
  }

  function timeOptions() {
    return timeOptionsRange(0, 23)
  }

  function timeOptionsRange(minHour: number, maxHour: number) {
    const out: string[] = []
    for (let h = minHour; h <= maxHour; h++) {
      for (let m of [0, 30]) {
        const hh = String(h).padStart(2, '0')
        const mm = String(m).padStart(2, '0')
        out.push(`${hh}:${mm}`)
      }
    }
    return out
  }

  function timeToMinutes(t: string) {
    const [hh, mm] = t.split(':').map(Number)
    return hh * 60 + mm
  }

  function formatDate(k: DateKey) {
    const date = new Date(k.y, k.m, k.d)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function ensureCheckoutAfterCheckin() {
    if (!checkIn || !checkOut || !checkInTime || !checkOutTime) return
    const sameDay = keyOf(checkIn) === keyOf(checkOut)
    if (!sameDay) return
    if (timeToMinutes(checkOutTime) <= timeToMinutes(checkInTime)) {
      // bump checkout by 60 minutes
      const mins = timeToMinutes(checkInTime) + 60
      const hh = Math.floor(mins / 60)
      const mm = mins % 60
      setCheckOutTime(`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`)
    }
  }

  function getDurationText() {
    if (!checkIn || !checkOut) return null
    const inIso = isoWithTime(checkIn, checkInTime)
    const outIso = isoWithTime(checkOut, checkOutTime)
    if (!inIso || !outIso) return null
    const a = new Date(inIso)
    const b = new Date(outIso)
    const diff = b.getTime() - a.getTime()
    if (diff <= 0) return null
    const hours = Math.round(diff / (1000 * 60 * 60))
    const nights = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (nights >= 1) return `${nights} night${nights > 1 ? 's' : ''} • ${hours} hours`
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const [isMobile, setIsMobile] = useState(false)
  const [measured, setMeasured] = useState<DOMRect | null>(null)

  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return
      setIsMobile(window.innerWidth <= 640)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    function measure() {
      if (!anchorEl || typeof anchorEl.getBoundingClientRect !== "function") {
        setMeasured(null)
        return
      }
      setMeasured(anchorEl.getBoundingClientRect())
    }
    measure()
    const ro = new ResizeObserver(measure)
    window.addEventListener("scroll", measure, true)
    window.addEventListener("resize", measure)
    if (anchorEl) ro.observe(anchorEl)
    return () => {
      window.removeEventListener("scroll", measure, true)
      window.removeEventListener("resize", measure)
      try { ro.disconnect() } catch {}
    }
  }, [anchorEl])

  let style: React.CSSProperties = { position: "absolute", left: 0 }
  if (isMobile) {
    style = { position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60 }
  } else if (measured) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200
    const baseWidth = Math.min(720, Math.max(280, measured.width || 360))
    // ensure enough width for two-month desktop layout (two columns of ~320px)
    const desiredWidth = !isMobile ? Math.min(900, Math.max(640, baseWidth)) : baseWidth
    const left = Math.min(Math.max(8, measured.left), Math.max(8, vw - desiredWidth - 8))
    const estHeight = 360
    let top = measured.bottom + 8
    if (typeof window !== "undefined" && top + estHeight > window.innerHeight) top = measured.top - estHeight - 8
    style = { position: "fixed", left, top, width: desiredWidth, zIndex: 60 }
  }

  const duration = getDurationText()

  useEffect(() => {
    ensureCheckoutAfterCheckin()
  }, [checkInTime, checkOutTime, checkIn, checkOut])

  const calendarEl = (
    <>
      {isMobile && <button type="button" aria-label="Close date picker" onClick={onClose} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />}
      <div style={style} role="dialog" aria-modal="true" aria-label="Select stay dates" className="max-h-[90dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-none sm:overflow-visible sm:rounded-2xl sm:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Select dates</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Choose check-in, then check-out</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-accent"><X /></button>
        </div>
      </div>

      <div className="mt-4 block sm:flex sm:gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => shiftBothMonths(-1)} aria-label="Previous month" className="rounded-full p-2 hover:bg-accent"><ChevronLeft className="size-5" /></button>
            <div className="font-medium">{MONTHS[view.m]} {view.y}</div>
            <button type="button" onClick={() => shiftBothMonths(1)} aria-label="Next month" className="rounded-full p-2 hover:bg-accent"><ChevronRight className="size-5" /></button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center sm:gap-2">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-xs font-semibold text-muted-foreground">{w}</div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isBooked = booked.has(day)
              const key = keyOf({ y: view.y, m: view.m, d: day })
              const disabled = isBooked || key < todayKey
              const isEdgeStart = checkIn && key === keyOf(checkIn)
              const isEdgeEnd = checkOut && key === keyOf(checkOut)
              const inRange = checkIn && checkOut && key > keyOf(checkIn) && key < keyOf(checkOut)
              const base = disabled ? 'text-muted-foreground/40 line-through' : 'hover:bg-accent'
              const sizeClass = 'aspect-square w-full sm:h-12 sm:w-12'
              const rangeClass = isEdgeStart ? 'bg-primary text-primary-foreground rounded-l-full' : isEdgeEnd ? 'bg-primary text-primary-foreground rounded-r-full' : inRange ? 'bg-accent text-accent-foreground' : ''
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleSelect(day)}
                  aria-label={`${day} ${MONTHS[view.m]}${isBooked ? ' — unavailable' : ''}`}
                  className={`${sizeClass} rounded-full text-sm font-medium transition-colors ${base} ${rangeClass}`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {!isMobile && (
          <div className="flex-1 min-w-[320px]">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => shiftBothMonths(-1)} aria-label="Previous month" className="rounded-full p-2 hover:bg-accent"><ChevronLeft className="size-5" /></button>
              <div className="font-medium">{MONTHS[nextView.m]} {nextView.y}</div>
              <button type="button" onClick={() => shiftBothMonths(1)} aria-label="Next month" className="rounded-full p-2 hover:bg-accent"><ChevronRight className="size-5" /></button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center">
              {WEEKDAYS.map((w, i) => (
                <div key={`n-${i}`} className="text-xs font-semibold text-muted-foreground">{w}</div>
              ))}
              {Array.from({ length: new Date(nextView.y, nextView.m, 1).getDay() }).map((_, i) => (
                <div key={`ne-${i}`} />
              ))}
              {Array.from({ length: new Date(nextView.y, nextView.m + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1
                const isBooked = bookedNext.has(day)
                const key = keyOf({ y: nextView.y, m: nextView.m, d: day })
                const disabled = isBooked || key < todayKey
                const isEdgeStart = checkIn && key === keyOf(checkIn)
                const isEdgeEnd = checkOut && key === keyOf(checkOut)
                const inRange = checkIn && checkOut && key > keyOf(checkIn) && key < keyOf(checkOut)
                const base = disabled ? 'text-muted-foreground/40 line-through' : 'hover:bg-accent'
                const sizeClass = 'h-12 w-12'
                const rangeClass = isEdgeStart ? 'bg-primary text-primary-foreground rounded-l-full' : isEdgeEnd ? 'bg-primary text-primary-foreground rounded-r-full' : inRange ? 'bg-accent text-accent-foreground' : ''
                return (
                  <button
                    key={`n-${day}`}
                    disabled={disabled}
                    onClick={() => handleSelect(day, nextView.y, nextView.m)}
                    className={`${sizeClass} rounded-md text-sm font-medium transition-colors ${base} ${rangeClass}`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {duration && (
        <div className="mt-4 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-foreground">Duration: {duration}</div>
      )}
      {/* Time pickers for selected dates */}
      <div className="mt-4 w-full">
        <div className="grid gap-4 sm:grid-cols-2">
          {checkIn && (
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="text-sm font-semibold text-foreground">Check-in</div>
              <div className="mt-1 text-sm text-muted-foreground">{formatDate(checkIn)}</div>
              <div className="mt-3 text-sm font-medium text-foreground">Check-in time</div>
              <select
                value={checkInTime ?? ''}
                onChange={(e) => { setCheckInTime(e.target.value); setOpenTimePicker(null) }}
                className="mt-1 w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-sm"
              >
                {(checkIn && checkOut && keyOf(checkIn) === keyOf(checkOut) ? timeOptionsRange(5, 18) : timeOptions()).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          {checkOut && (
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <div className="text-sm font-semibold text-foreground">Check-out</div>
              <div className="mt-1 text-sm text-muted-foreground">{formatDate(checkOut)}</div>
              <div className="mt-3 text-sm font-medium text-foreground">Check-out time</div>
              <select
                value={checkOutTime ?? ''}
                onChange={(e) => { setCheckOutTime(e.target.value); setOpenTimePicker(null) }}
                className="mt-1 w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-sm"
              >
                {(checkIn && checkOut && keyOf(checkIn) === keyOf(checkOut) ? timeOptionsRange(5, 18) : timeOptions()).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 flex gap-2 border-t border-border pt-4">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium">Cancel</button>
        <button type="button" onClick={apply} disabled={!checkIn || !checkOut} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">Apply dates</button>
      </div>
      </div>
    </>
  )

  if (typeof document === 'undefined') return null
  return createPortal(calendarEl, document.body)
}
