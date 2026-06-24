import { Star, Quote } from "lucide-react"

const reviews = [
  {
    name: "Lakshmi Narayanan",
    city: "Chennai",
    text: "Booked a room 5 minutes from the temple. Spotless, friendly staff, and we made it for the 5 AM darshan with ease.",
    rating: 5,
  },
  {
    name: "Arjun Menon",
    city: "Kochi",
    text: "The sea-view suite was stunning and the price was lower than anywhere else. Free cancellation gave us peace of mind.",
    rating: 5,
  },
  {
    name: "Priya & Family",
    city: "Bengaluru",
    text: "Travelling with elderly parents was easy thanks to the walk-to-temple stay and helpful local support team.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="reviews" className="bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Loved by pilgrims
          </span>
          <h2 className="mt-2 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Rated 4.8 by 12,000+ travellers
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-3xl border border-border bg-card p-6"
            >
              <Quote className="size-7 text-primary/40" />
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                {r.text}
              </blockquote>
              <figcaption className="mt-4 border-t border-border/70 pt-4">
                <div className="text-sm font-semibold text-foreground">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
