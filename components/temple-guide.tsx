import Image from "next/image"
import { Sunrise, Clock, Footprints } from "lucide-react"
import { Button } from "@/components/ui/button"

const facts = [
  { icon: Sunrise, label: "Best darshan time", value: "5:00 AM – 7:00 AM" },
  { icon: Clock, label: "Temple timings", value: "5 AM – 9 PM daily" },
  { icon: Footprints, label: "Sea-shore arati", value: "Steps from the waves" },
]

export function TempleGuide() {
  return (
    <section id="temple" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative order-last aspect-[4/5] overflow-hidden rounded-3xl lg:order-first">
          <Image
            src="/images/temple-detail.png"
            alt="Ornate gopuram carvings of the Tiruchendur Murugan Temple"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Temple guide
          </span>
          <h2 className="mt-2 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            One of the six abodes of Lord Murugan
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            The Thiruchendur Arulmigu Subramaniya Swamy Temple rises right where
            the Bay of Bengal meets the shore — a rare seaside temple among the
            Arupadai Veedu. Plan your darshan, book a stay nearby, and wake up to
            temple bells and ocean breeze.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <f.icon className="size-5 text-primary" />
                <div className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {f.value}
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" className="mt-6">
            Explore temple-side stays
          </Button>
        </div>
      </div>
    </section>
  )
}
