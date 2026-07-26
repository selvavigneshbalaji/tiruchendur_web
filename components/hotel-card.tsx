"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, Heart, MapPin, CalendarDays, Eye, ChevronLeft, ChevronRight, Images } from "lucide-react"
import { getDisplayPrice, isAvailableForRange, type Hotel } from "@/lib/hotels"
import { Button } from "@/components/ui/button"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { useSearch } from "@/lib/search-context"

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isGalleryPaused, setIsGalleryPaused] = useState(false)
  const { criteria } = useSearch()

  const galleryImages = useMemo(
    () => Array.from(new Set([hotel.image, ...(hotel.images || [])].filter(Boolean))),
    [hotel.image, hotel.images],
  )
  const hasMultipleImages = galleryImages.length > 1
  const activeImage = galleryImages[activeImageIndex] || "/placeholder.svg"

  useEffect(() => {
    setActiveImageIndex((current) => Math.min(current, Math.max(galleryImages.length - 1, 0)))
  }, [galleryImages.length])

  useEffect(() => {
    if (!hasMultipleImages || isGalleryPaused) return

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % galleryImages.length)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [galleryImages.length, hasMultipleImages, isGalleryPaused])

  const displayPrice = useMemo(() => getDisplayPrice(hotel, criteria.checkIn, criteria.guests), [hotel, criteria.checkIn, criteria.guests])

  const hasDates = criteria.checkIn !== "" && criteria.checkOut !== ""
  const propertyHref = useMemo(() => {
    const params = new URLSearchParams()
    if (criteria.checkIn) params.set("checkIn", criteria.checkIn)
    if (criteria.checkOut) params.set("checkOut", criteria.checkOut)
    if (criteria.guests) params.set("guests", String(criteria.guests))

    const query = params.toString()
    return `/properties/${hotel.id}${query ? `?${query}` : ""}`
  }, [hotel.id, criteria.checkIn, criteria.checkOut, criteria.guests])
  const isAvailable = useMemo(() => {
    if (!hasDates) return false
    return isAvailableForRange(hotel.id, criteria.checkIn, criteria.checkOut, hotel)
  }, [hotel, criteria.checkIn, criteria.checkOut, hasDates])

  return (
    <>
      <div
        className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
        onClick={() => {
          if (hasDates && isAvailable) {
            router.push(`/properties/${hotel.id}`)
          }
        }}
      >
        <div
          className="relative aspect-[4/3] overflow-hidden"
          onMouseEnter={() => setIsGalleryPaused(true)}
          onMouseLeave={() => setIsGalleryPaused(false)}
        >
          <Image
            src={activeImage}
            alt={`${hotel.name} photo ${activeImageIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hotel.superhost && (
            <span className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground">
              Guest favourite
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLiked((v) => !v)
            }}
            aria-label="Save to wishlist"
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-transform hover:scale-110"
          >
            <Heart
              className={`size-5 transition-colors ${
                liked ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </button>
          {hotel.oldPrice && (
            <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {Math.round((1 - hotel.price / hotel.oldPrice) * 100)}% OFF
            </span>
          )}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                aria-label="Show previous photo"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
                }}
                className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Show next photo"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImageIndex((current) => (current + 1) % galleryImages.length)
                }}
                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition hover:bg-background"
              >
                <ChevronRight className="size-4" />
              </button>
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground">
                <Images className="size-3" />
                {activeImageIndex + 1}/{galleryImages.length}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={propertyHref}
              onClick={(e) => e.stopPropagation()}
              className="font-serif text-lg font-semibold leading-tight text-foreground transition-colors hover:text-primary hover:underline"
            >
              {hotel.name}
            </Link>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
              <Star className="size-4 fill-primary text-primary" />
              {hotel.rating}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            {hotel.distance}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-border/70 pt-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-foreground" data-testid="hotel-price">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
                {hotel.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{hotel.oldPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                per night · {hotel.reviews} reviews
              </span>
            </div>
            {!hasDates ? (
              <Button
                size="lg"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCalendar(true)
                }}
              >
                <CalendarDays className="size-4" />
                Check dates
              </Button>
            ) : isAvailable ? (
              <Button
                size="lg"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  const params = new URLSearchParams()
                  if (criteria.checkIn) params.set('checkIn', criteria.checkIn)
                  if (criteria.checkOut) params.set('checkOut', criteria.checkOut)
                  if (criteria.guests) params.set('guests', String(criteria.guests))
                  router.push(`/properties/${hotel.id}?${params.toString()}`)
                }}
              >
                <Eye className="size-4" />
                View Details
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="gap-2 cursor-not-allowed opacity-50"
                disabled
              >
                <CalendarDays className="size-4" />
                Not Available
              </Button>
            )}
          </div>
        </div>
      </div>

      {showCalendar && (
        <AvailabilityCalendar hotel={hotel} onClose={() => setShowCalendar(false)} />
      )}
    </>
  )
}
