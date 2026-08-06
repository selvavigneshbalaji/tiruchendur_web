import type { MetadataRoute } from 'next'

const siteUrl = 'https://www.tiruchendurstay.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: siteUrl, lastModified, changeFrequency: 'daily', priority: 1 },
    ...['1', '2', '3'].map((id) => ({ url: `${siteUrl}/properties/${id}`, lastModified, changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...['tiruchendur-temple-darshan-timings', 'best-time-to-visit-tiruchendur', 'tiruchendur-kanda-sashti-festival', 'how-to-reach-tiruchendur'].flatMap((slug) => [
      { url: `${siteUrl}/blog/${slug}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${siteUrl}/${slug}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    ]),
  ]
}
