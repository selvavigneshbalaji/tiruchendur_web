"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CalendarDays, Send, User, Phone, FileText, AlertCircle } from "lucide-react"
import { getDisplayPrice, getPriceForDateRange, type Hotel } from "@/lib/hotels"

const WHATSAPP_NUMBER = "919688104147"

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = end.getTime() - start.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

function isValidPhone(phone: string): boolean {
  // Indian mobile: 10 digits, optional +91 or 0 prefix
  const cleaned = phone.replace(/[\s\-()]/g, "")
  return /^(?:\+91|0)?[6-9]\d{9}$/.test(cleaned)
}

function isValidName(name: string): boolean {
  return name.trim().length >= 2
}

export function BookingForm({
  hotel,
  checkIn,
  checkOut,
  guests = 1,
}: {
  hotel: Hotel
  checkIn?: string
  checkOut?: string
  guests?: number
}) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [details, setDetails] = useState("")
  const [touched, setTouched] = useState<{ name: boolean; phone: boolean }>({ name: false, phone: false })

  const nameError = touched.name && !isValidName(name) ? "Please enter your full name (at least 2 characters)" : ""
  const phoneError = touched.phone && !isValidPhone(phone) ? "Please enter a valid 10-digit Indian mobile number" : ""

  const canSubmit = isValidName(name) && isValidPhone(phone)

  const perNightPrice = useMemo(
    () => getDisplayPrice(hotel, checkIn || "", guests),
    [hotel, checkIn, guests]
  )

  const nights = useMemo(
    () => calculateNights(checkIn || "", checkOut || ""),
    [checkIn, checkOut]
  )

  const totalPrice = useMemo(() => {
    if (checkIn && checkOut) {
      return getPriceForDateRange(hotel, checkIn, checkOut, guests)
    }
    return perNightPrice
  }, [hotel, checkIn, checkOut, guests, perNightPrice])

  const hasDates = checkIn && checkOut

  const handleSendBooking = useCallback(() => {
    if (!canSubmit) return

    const message = [
      "*New Booking Request*",
      "",
      `*Property:* ${hotel.name}`,
      `*Location:* ${hotel.area}`,
      checkIn ? `*Check-in:* ${formatDate(checkIn)}` : "",
      checkOut ? `*Check-out:* ${formatDate(checkOut)}` : "",
      nights > 0 ? `*Nights:* ${nights}` : "",
      `*Guests:* ${guests}`,
      `*Per Night:* ₹${perNightPrice.toLocaleString("en-IN")}`,
      `*Total:* ₹${totalPrice.toLocaleString("en-IN")}`,
      "",
      `*Guest Name:* ${name.trim()}`,
      `*Phone:* ${phone.trim()}`,
      details ? `*Additional Details:* ${details}` : "",
    ]
      .filter(Boolean)
      .join("%0A")

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(waUrl, "_blank")
  }, [canSubmit, hotel, checkIn, checkOut, guests, nights, perNightPrice, totalPrice, name, phone, details])

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6">
      <h2 className="font-serif text-2xl font-semibold text-foreground">
        Book this stay
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill in your details and we&apos;ll send a booking request to the host.
      </p>

      {/* Price Summary */}
      <div className="mt-5 rounded-2xl border border-border/70 bg-background/70 p-4">
        <h3 className="text-sm font-semibold text-foreground">Price Summary</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>
              ₹{perNightPrice.toLocaleString("en-IN")} x {nights > 0 ? nights : 1} night{nights !== 1 ? "s" : ""}
            </span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Guests</span>
            <span>{guests}</span>
          </div>
          {hasDates && (
            <div className="flex justify-between text-muted-foreground">
              <span>Check-in</span>
              <span className="font-medium text-foreground">{formatDate(checkIn!)}</span>
            </div>
          )}
          {hasDates && (
            <div className="flex justify-between text-muted-foreground">
              <span>Check-out</span>
              <span className="font-medium text-foreground">{formatDate(checkOut!)}</span>
            </div>
          )}
          <div className="border-t border-border/70 pt-2 flex justify-between font-semibold text-foreground">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="mt-5 space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <User className="size-4 text-primary" />
            Your Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="Enter your full name"
            className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary ${
              nameError ? "border-destructive" : "border-border/50"
            }`}
          />
          {nameError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3" />
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Phone className="size-4 text-primary" />
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            placeholder="Enter your 10-digit mobile number"
            className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary ${
              phoneError ? "border-destructive" : "border-border/50"
            }`}
          />
          {phoneError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3" />
              {phoneError}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="size-4 text-primary" />
            Check-in Date
          </label>
          <input
            type="date"
            value={checkIn || ""}
            readOnly
            className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="size-4 text-primary" />
            Check-out Date
          </label>
          <input
            type="date"
            value={checkOut || ""}
            readOnly
            className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="size-4 text-primary" />
            Additional Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Any special requests, number of guests, etc."
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none"
          />
        </div>

        <Button
          size="lg"
          className="w-full gap-2 mt-2"
          onClick={handleSendBooking}
          disabled={!canSubmit}
        >
          <Send className="size-4" />
          Send Booking Request
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          You&apos;ll be redirected to WhatsApp to confirm your booking request.
        </p>
      </div>
    </div>
  )
}
