import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { articles } from '../blog/articles'

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      publishedTime: article.publishedTime,
      images: [{ url: '/images/temple-hero.png', width: 1200, height: 630, alt: 'Tiruchendur Murugan Temple by the sea' }],
    },
  }
}

export default async function BlogAliasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles[slug]
  if (!article) notFound()

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:py-20">
      <article className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:underline">← Browse the blog</Link>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline">Home</Link>
          </div>
          <Link href="/" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Browse stays</Link>
        </div>
        <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-primary">Tiruchendur travel guide</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{article.title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{article.intro}</p>
        <div className="mt-10 space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl font-semibold text-foreground">{section.heading}</h2>
              {section.paragraphs.map((paragraph: string) => (
                <p key={paragraph} className="mt-4 leading-7 text-muted-foreground">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Find your Tiruchendur stay</h2>
          <p className="mt-2 text-muted-foreground">Compare verified hotels and homestays near the Murugan Temple before you travel.</p>
          <Link href="/" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground">View stays</Link>
        </div>
      </article>
    </main>
  )
}
