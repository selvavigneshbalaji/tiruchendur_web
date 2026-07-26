import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Article = {
  title: string
  description: string
  publishedTime: string
  intro: string
  sections: { heading: string; paragraphs: string[] }[]
}

const articles: Record<string, Article> = {
  'tiruchendur-temple-darshan-timings': {
    title: 'Tiruchendur Temple Darshan Timings: Planning Your Visit',
    description: 'Plan a visit to Tiruchendur Murugan Temple with darshan planning tips, travel advice and nearby accommodation suggestions.',
    publishedTime: '2026-07-26',
    intro: 'Tiruchendur Murugan Temple is one of Tamil Nadu’s most visited coastal pilgrimage sites. A little planning makes it easier to have a calm darshan and find a convenient stay nearby.',
    sections: [
      { heading: 'Darshan planning', paragraphs: ['Temple opening hours and pooja schedules may vary for festivals, special occasions and temple administration notices. Confirm the current timings with the official temple channels before starting your journey.', 'Early morning is often a comfortable time for visitors who prefer a quieter darshan. Allow extra time for queues on weekends, holidays and festival days.'] },
      { heading: 'Where to stay near the temple', paragraphs: ['Choose a hotel or homestay based on walking distance, family room needs and your arrival time. Staying near Temple Road can help make early visits more convenient.', 'Browse Tiruchendur Stays for accommodation details, room photos and availability before you travel.'] },
    ],
  },
  'best-time-to-visit-tiruchendur': {
    title: 'Best Time to Visit Tiruchendur: Weather, Festivals and Travel Tips',
    description: 'Discover the best time to visit Tiruchendur, including seasonal travel advice, festival planning and accommodation tips.',
    publishedTime: '2026-07-26',
    intro: 'Tiruchendur combines a busy pilgrimage calendar with a beautiful Bay of Bengal coastline. The right time to visit depends on whether you want cooler sightseeing weather or the atmosphere of a major festival.',
    sections: [
      { heading: 'Season guide', paragraphs: ['The cooler months are generally more comfortable for temple visits, beach walks and local sightseeing. Summer travel is possible, but plan water, sun protection and a midday rest.', 'The northeast monsoon can bring rain to the Tamil Nadu coast. Check the forecast and local transport conditions before a rainy-season journey.'] },
      { heading: 'Festival travel', paragraphs: ['Kanda Sashti and other temple festivals bring a memorable energy—and much larger crowds. Reserve your stay well ahead, especially if you need a family room or property close to the temple.', 'For a quieter break, choose a weekday outside school holidays and arrive with flexibility around darshan queues.'] },
    ],
  },
  'tiruchendur-kanda-sashti-festival': {
    title: 'Tiruchendur Kanda Sashti Festival 2026: Stay and Travel Guide',
    description: 'Prepare for the Tiruchendur Kanda Sashti festival with accommodation planning, crowd tips and practical travel guidance.',
    publishedTime: '2026-07-26',
    intro: 'Kanda Sashti is an important Murugan festival and Tiruchendur welcomes pilgrims from across Tamil Nadu and beyond. Booking accommodation early is the single most useful preparation.',
    sections: [
      { heading: 'Plan early for 2026', paragraphs: ['Festival dates and programme details are confirmed by the temple administration. Check the official announcement before making non-refundable travel arrangements.', 'Reserve a hotel or homestay as soon as your travel dates are clear. Properties within walking distance of the temple are especially popular during the festival.'] },
      { heading: 'Crowd and travel tips', paragraphs: ['Expect heavier traffic, longer queues and limited local transport during peak rituals. Arrive early, carry essentials and leave extra time between your stay, the temple and transport connections.', 'If travelling with children or elderly relatives, consider a nearby property so your group can rest between temple visits.'] },
    ],
  },
  'how-to-reach-tiruchendur': {
    title: 'How to Reach Tiruchendur: Train, Bus and Flight Travel Guide',
    description: 'A practical guide to reaching Tiruchendur by train, bus and air, including local transport and stay planning.',
    publishedTime: '2026-07-26',
    intro: 'Tiruchendur is well connected to other parts of Tamil Nadu by rail and road. Plan the final leg of your journey in advance, particularly during temple festivals.',
    sections: [
      { heading: 'By train, bus or flight', paragraphs: ['Tiruchendur has rail and bus connections from major Tamil Nadu cities. Check the latest schedules with your preferred rail or bus operator before departure.', 'For air travel, compare the nearest airport options with onward road or rail transport. Pre-booking an onward taxi can make late arrivals easier.'] },
      { heading: 'Getting around town', paragraphs: ['Auto-rickshaws and taxis can help with local travel. If you are staying close to the temple, many key areas can be reached on foot.', 'Share your estimated arrival time with your accommodation host and choose a stay that suits your transport route and group size.'] },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return {}
  return { title: article.title, description: article.description, alternates: { canonical: `/blog/${slug}` }, openGraph: { type: 'article', title: article.title, description: article.description, publishedTime: article.publishedTime, images: [{ url: '/images/temple-hero.png', width: 1200, height: 630, alt: 'Tiruchendur Murugan Temple by the sea' }] } }
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles[slug]
  if (!article) notFound()

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:py-20">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">← Browse Tiruchendur stays</Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-primary">Tiruchendur travel guide</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{article.title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{article.intro}</p>
        <div className="mt-10 space-y-10">
          {article.sections.map((section) => <section key={section.heading}><h2 className="font-serif text-2xl font-semibold text-foreground">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-muted-foreground">{paragraph}</p>)}</section>)}
        </div>
        <div className="mt-12 rounded-3xl border border-border bg-card p-6"><h2 className="font-serif text-2xl font-semibold text-foreground">Find your Tiruchendur stay</h2><p className="mt-2 text-muted-foreground">Compare verified hotels and homestays near the Murugan Temple before you travel.</p><Link href="/" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground">View stays</Link></div>
      </article>
    </main>
  )
}
