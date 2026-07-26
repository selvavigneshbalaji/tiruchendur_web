import Image from "next/image"
import { Star, ShieldCheck, BadgePercent } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative">
        <div className="relative h-[460px] w-full sm:h-[520px] lg:h-[560px]">
          <Image
            src="/images/temple-hero.png"
            alt="Tiruchendur Murugan Temple beside the sea at sunrise"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/30 to-background" />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-background/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Star className="size-3.5 fill-primary text-primary" />
              Sacred coast of Tamil Nadu
            </span>
            <h1 className="mt-4 max-w-2xl text-balance font-serif text-4xl font-semibold leading-[1.05] text-background sm:text-5xl lg:text-6xl">
              Hotels & Homestays in Tiruchendur near Murugan Temple
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base text-background/90 sm:text-lg">
              Hand-picked hotels, heritage homes and beachfront resorts in
              Tiruchendur. Best price guaranteed, with free cancellation.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-5xl px-4 sm:-mt-20 sm:px-6">
        <SearchBar />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Verified temple-town stays
          </span>
          <span className="flex items-center gap-2">
            <BadgePercent className="size-4 text-primary" />
            Up to 30% off this season
          </span>
          <span className="flex items-center gap-2">
            <Star className="size-4 text-primary" />
            12,000+ happy pilgrims
          </span>
        </div>
      </div>
    </section>
  )
}
