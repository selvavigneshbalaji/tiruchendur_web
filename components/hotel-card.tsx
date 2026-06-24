"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, Heart, MapPin, CalendarDays } from "lucide-react"
import type { Hotel } from "@/lib/hotels"
import { Button } from "@/components/ui/button"
import { AvailabilityCalendar } from "@/components/availability-calendar"

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const [liked, setLiked] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
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
          onClick={() => setLiked((v) => !v)}
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
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
            {hotel.name}
          </h3>
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
              <span className="text-xl font-bold text-foreground">
                ₹{hotel.price.toLocaleString("en-IN")}
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
          <Button size="lg" className="gap-2" onClick={() => setShowCalendar(true)}>
            <CalendarDays className="size-4" />
            Check dates
          </Button>
        </div>
      </div>

      {showCalendar && (
        <AvailabilityCalendar hotel={hotel} onClose={() => setShowCalendar(false)} />
      )}
    </article>
  )
}
