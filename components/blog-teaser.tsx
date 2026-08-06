import Link from 'next/link'
import { articles } from '@/app/blog/articles'

export function BlogTeaser() {
  return (
    <section id="blog" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Tiruchendur travel tips</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Latest blog posts</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Read practical guides on temple timings, the best season to visit, festival planning, and how to reach Tiruchendur.
            </p>
          </div>
          <Link href="/blog" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90">
            View all blogs
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {Object.entries(articles).slice(0, 2).map(([slug, article]) => (
            <article key={slug} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground">{article.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{article.description}</p>
              <Link href={`/blog/${slug}`} className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
                Read more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
