export const revalidate = 60

import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import { ArrowLeft, CalendarDays, MapPin, Phone, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDisplayPrice, getHotels } from "@/lib/hotels"
import { BookingForm } from "@/components/booking-form"
import { PropertyGallery } from "@/components/property-gallery"

export async function generateStaticParams() {
  const hotels = await getHotels()
  return hotels.map((hotel) => ({ id: hotel.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const hotel = (await getHotels()).find((item) => item.id === id)
  if (!hotel) return { title: 'Stay in Tiruchendur near Murugan Temple' }

  const title = `${hotel.name} Tiruchendur | ${hotel.category} stay near Murugan Temple`
  const description = `${hotel.description} From ₹${hotel.price.toLocaleString('en-IN')} per night.`
  return { title, description, alternates: { canonical: `/properties/${hotel.id}` }, openGraph: { title: `${hotel.name} — ${hotel.category} stay in Tiruchendur`, description, images: [{ url: hotel.image, alt: hotel.name }] } }
}

export default async function PropertyPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }> }) {
  const { id } = await params
  const { checkIn, checkOut, guests: guestsParam } = await searchParams
  const hotels = await getHotels()

  const hotel = hotels.find((item) => item.id === id)
  if (!hotel) notFound()

  const galleryImages = Array.from(new Set([hotel.image, ...(hotel.images || [])].filter(Boolean)))
  const guests = Number.isFinite(Number(guestsParam)) && Number(guestsParam) > 0 ? Math.floor(Number(guestsParam)) : 1
  const backParams = new URLSearchParams()
  if (checkIn) backParams.set('checkIn', checkIn)
  if (checkOut) backParams.set('checkOut', checkOut)
  if (guestsParam) backParams.set('guests', String(guests))
  const backHref = backParams.toString() ? `/?${backParams.toString()}` : '/'

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="size-4" />
          Back to stays
        </Link>

        <div className="mt-6 overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <PropertyGallery images={galleryImages} hotelName={hotel.name} />

            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="font-serif text-3xl font-semibold text-foreground">{hotel.name}</h1>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 text-primary" />
                      {hotel.area} · {hotel.distance}
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {hotel.category}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="size-4 fill-primary text-primary" />
                  {hotel.rating} · {hotel.reviews} reviews
                </div>

                <p className="mt-5 text-sm leading-7 text-muted-foreground">{hotel.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {hotel.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">From</div>
                    <div className="mt-1 text-2xl font-bold text-foreground" data-testid="property-price">₹{getDisplayPrice(hotel, checkIn || '', guests).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">per night</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 gap-2">
                    <CalendarDays className="size-4" />
                    Check dates
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Phone className="size-4" />
                    Call host
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border/70 bg-card p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">About this stay</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{hotel.description}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <h3 className="font-semibold text-foreground">Host details</h3>
                <p className="mt-2 text-sm text-muted-foreground">Owner: {hotel.ownerName}</p>
                <p className="mt-1 text-sm text-muted-foreground">Contact: {hotel.ownerContact}</p>
                <p className="mt-1 text-sm text-muted-foreground">Max guests: {hotel.maxGuests}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <h3 className="font-semibold text-foreground">House rules</h3>
                <ul className="mt-3 space-y-2">
                  {hotel.rules.map((rule) => (
                    <li key={rule} className="text-sm text-muted-foreground">
                      • {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <BookingForm hotel={hotel} checkIn={checkIn} checkOut={checkOut} guests={guests} />
        </div>
      </div>
    </main>
  )
}
