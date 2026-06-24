import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { StaysSection } from "@/components/stays-section"
import { WhyUs } from "@/components/why-us"
import { TempleGuide } from "@/components/temple-guide"
import { Testimonials } from "@/components/testimonials"
import { CtaFooter } from "@/components/cta-footer"
import { SearchProvider } from "@/lib/search-context"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <SearchProvider>
        <Hero />
        <StaysSection />
      </SearchProvider>
      <WhyUs />
      <TempleGuide />
      <Testimonials />
      <CtaFooter />
    </main>
  )
}
