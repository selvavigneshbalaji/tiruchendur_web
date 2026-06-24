import { MapPinned, BadgeIndianRupee, CalendarCheck, Headphones } from "lucide-react"

const items = [
  {
    icon: MapPinned,
    title: "Closest to the temple",
    desc: "Stays mapped by walking distance to the Murugan Temple gopuram.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Best price promise",
    desc: "Find it cheaper elsewhere and we match the price, instantly.",
  },
  {
    icon: CalendarCheck,
    title: "Free cancellation",
    desc: "Plans change. Cancel most bookings up to 24 hours before check-in.",
  },
  {
    icon: Headphones,
    title: "24×7 local support",
    desc: "Tamil & English helpline run by people who live in Tiruchendur.",
  },
]

export function WhyUs() {
  return (
    <section id="why" className="bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Why Tiruchendur Stays
          </span>
          <h2 className="mt-2 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Booking made effortless for your pilgrimage
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                <item.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
