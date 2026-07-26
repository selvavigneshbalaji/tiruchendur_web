import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { StaysSection } from "@/components/stays-section"
import { WhyUs } from "@/components/why-us"
import { TempleGuide } from "@/components/temple-guide"
import { Testimonials } from "@/components/testimonials"
import { CtaFooter } from "@/components/cta-footer"
import { SearchProvider } from "@/lib/search-context"
import { getHotels } from "@/lib/hotels"

export default async function Page({ searchParams }: { searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }> }) {
  const hotels = await getHotels()
  const params = await searchParams
  const guests = Number.isFinite(Number(params.guests)) && Number(params.guests) > 0 ? Math.floor(Number(params.guests)) : undefined

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <SearchProvider
        initialCriteria={{
          checkIn: params.checkIn || "",
          checkOut: params.checkOut || "",
          guests: guests ?? 2,
          searched: Boolean(params.checkIn && params.checkOut),
        }}
      >
        <Hero />
        <StaysSection initialHotels={hotels} />
      </SearchProvider>
      <WhyUs />
      <TempleGuide />
      <Testimonials />
      <CtaFooter />
    </main>
  )
}
