import Link from 'next/link'
import { getAllBlogPosts, type BlogPost } from '@/lib/blog-data'

export default async function BlogIndex() {
  const posts = await getAllBlogPosts()

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Tiruchendur travel guide</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">Blog and travel tips for Tiruchendur</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Read practical guides on darshan timings, travel planning, festival visits and how to reach Tiruchendur.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90">
            ← Browse Tiruchendur stays
          </Link>
        </div>
        <div className="mt-12 space-y-8">
          {posts.map((article) => (
            <article key={article.slug} className="rounded-3xl border border-border bg-card p-8">
              <Link href={`/blog/${article.slug}`} className="text-2xl font-semibold text-foreground hover:text-primary">
                {article.title}
              </Link>
              <p className="mt-4 text-muted-foreground">{article.description}</p>
              <p className="mt-4 text-sm uppercase tracking-wide text-primary">Published {article.publishedTime}</p>
              <Link href={`/blog/${article.slug}`} className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                Read article
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
