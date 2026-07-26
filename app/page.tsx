import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { StaysSection } from "@/components/stays-section"
import { WhyUs } from "@/components/why-us"
import { TempleGuide } from "@/components/temple-guide"
import { Testimonials } from "@/components/testimonials"
import { CtaFooter } from "@/components/cta-footer"
import { SearchProvider } from "@/lib/search-context"
import { getHotels } from "@/lib/hotels"

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': 'https://www.tiruchendurstay.in/#website', url: 'https://www.tiruchendurstay.in', name: 'Tiruchendur Stays', description: 'Book hotels and homestays near Tiruchendur Murugan Temple', potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://www.tiruchendurstay.in/?search={search_term_string}' }, 'query-input': 'required name=search_term_string' } },
      { '@type': 'TravelAgency', '@id': 'https://www.tiruchendurstay.in/#organization', name: 'Tiruchendur Stays', url: 'https://www.tiruchendurstay.in', telephone: '+919688104147', email: 'info@tiruchendurstay.in', description: 'The trusted way to book hotels and homestays near Tiruchendur Murugan Temple', address: { '@type': 'PostalAddress', streetAddress: 'Tiruchendur', addressLocality: 'Tiruchendur', addressRegion: 'Tamil Nadu', postalCode: '628215', addressCountry: 'IN' }, geo: { '@type': 'GeoCoordinates', latitude: 8.4967, longitude: 78.1213 }, areaServed: { '@type': 'City', name: 'Tiruchendur' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '127', bestRating: '5' }, sameAs: ['https://www.google.com/maps?q=Tiruchendur+Murugan+Temple', 'https://wa.me/9688104147'] },
      { '@type': 'FAQPage', mainEntity: [
        ['What are the best homestays in Tiruchendur near the Murugan Temple?', 'Explore verified homestays near Tiruchendur Murugan Temple on Tiruchendur Stays. Compare location, amenities, guest capacity and prices before booking.'],
        ['What are the Tiruchendur temple darshan timings?', 'Tiruchendur Murugan Temple is generally open from 5:00 AM to 9:00 PM daily. Timings can change for festivals and special poojas, so confirm with the temple before travel.'],
        ['How do I book a hotel in Tiruchendur?', 'Choose a stay on TiruchendurStay.in, select your dates and guests, then complete the booking form for a confirmation request.'],
        ['What is the distance from Tiruchendur temple to beach?', 'The Tiruchendur Murugan Temple is beside the sea, with the beach only a short walk from the temple gopuram.'],
      ].map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default async function Page({ searchParams }: { searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }> }) {
  const hotels = await getHotels()
  const params = await searchParams
  const guests = Number.isFinite(Number(params.guests)) && Number(params.guests) > 0 ? Math.floor(Number(params.guests)) : undefined

  return (
    <main className="min-h-screen bg-background">
      <JsonLd />
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
