"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export type Guests = {
  adults: number
  children: number
  infants: number
  pets: number
  rooms: number
}

export function GuestsPicker({
  value,
  onChange,
}: {
  value: Guests
  onChange: (next: Guests) => void
}) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!open) return
    function measure() {
      const el = btnRef.current
      if (!el || typeof el.getBoundingClientRect !== 'function') {
        setRect(null)
        return
      }
      setRect(el.getBoundingClientRect())
    }
    measure()
    const ro = new ResizeObserver(measure)
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    if (btnRef.current) ro.observe(btnRef.current)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
      try { ro.disconnect() } catch {}
    }
  }, [open])

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 640)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function inc(field: keyof Guests) {
    const next = { ...value, [field]: (value[field] as number) + 1 }
    onChange(next)
  }
  function dec(field: keyof Guests) {
    const min = field === 'rooms' ? 1 : 0
    const next = { ...value, [field]: Math.max(min, (value[field] as number) - 1) }
    onChange(next)
  }

  return (
    <div className="relative">
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-3 py-2 rounded-xl bg-accent/10 border border-border/30 text-sm font-semibold text-foreground shadow-sm"
        aria-expanded={open}
        aria-label="Select guests"
      >
        <div className="inline-block min-w-0 truncate text-sm">
          {value.adults + value.children} guests · {value.rooms} rooms
        </div>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <>
          {isMobile && <button type="button" aria-label="Close guest picker" onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" />}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select guests and rooms"
            style={isMobile ? { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60 } : rect ? { position: 'fixed', left: Math.max(8, rect.left), top: rect.bottom + 8, width: 320, zIndex: 60 } : undefined}
            className="max-h-[90dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-none sm:overflow-visible sm:rounded-2xl sm:p-4 sm:shadow-lg"
          >
          <div className="mb-4 flex items-start justify-between sm:hidden">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground">Guests and rooms</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose who is staying with you.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-accent" aria-label="Close guest picker">×</button>
          </div>
          <Counter label="Adults" sub="Ages 13 or above" value={value.adults} onInc={() => inc("adults")} onDec={() => dec("adults")} />
          <div className="my-3 h-px bg-border" />
          <Counter label="Children" sub="Ages 2–12" value={value.children} onInc={() => inc("children")} onDec={() => dec("children")} />
          <div className="my-3 h-px bg-border" />
          <Counter label="Rooms" sub="Number of rooms" value={value.rooms} onInc={() => inc("rooms")} onDec={() => dec("rooms")} />
          <div className="my-3 h-px bg-border" />
          <Counter label="Infants" sub="Under 2" value={value.infants} onInc={() => inc("infants")} onDec={() => dec("infants")} />
          <div className="my-3 h-px bg-border" />
          <Counter label="Pets" sub="Bringing a service animal?" value={value.pets} onInc={() => inc("pets")} onDec={() => dec("pets")} />
          <div className="mt-5 flex justify-end border-t border-border pt-4 sm:mt-4 sm:border-0 sm:pt-0">
            <button type="button" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground sm:w-auto sm:rounded-full sm:py-2" onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

function Counter({ label, sub, value, onInc, onDec }: { label: string; sub: string; value: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onDec} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg text-foreground disabled:opacity-40 sm:h-8 sm:w-8 sm:text-base" disabled={value === 0}>−</button>
        <div className="text-sm text-foreground">{value}</div>
        <button type="button" onClick={onInc} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg text-foreground sm:h-8 sm:w-8 sm:text-base">+</button>
      </div>
    </div>
  )
}
