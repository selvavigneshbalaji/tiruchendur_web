import { articles as defaultArticles, type Article } from "../app/blog/articles"

export type BlogPost = Article & {
  slug: string
  image?: string
}

export const BLOG_STORAGE_KEY = "tiruchendur_custom_blog_posts_v1"

export const defaultBlogPosts: BlogPost[] = Object.entries(defaultArticles).map(([slug, article]) => ({
  ...article,
  slug,
  image: "/images/temple-hero.png",
}))

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const workerUrl = (process.env.PORTAL_WORKER_URL || "https://tiruchendur-stays-api.tiruchendur-stays-api.workers.dev").replace(/\/$/, "")
    const url = typeof window === "undefined" ? `${workerUrl}/admin/blogs` : "/api/admin/blogs"
    const response = await fetch(url, { cache: "no-store" })
    if (!response.ok) return defaultBlogPosts
    const data = await response.json() as { posts?: BlogPost[] }
    const merged = new Map(defaultBlogPosts.map((post) => [post.slug, post]))
    for (const post of data.posts || []) merged.set(post.slug, post)
    return Array.from(merged.values()).sort((a, b) => new Date(b.publishedTime).getTime() - new Date(a.publishedTime).getTime())
  } catch {
    return defaultBlogPosts
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return fetchBlogPosts()
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts()
  return posts.find((post) => post.slug === slug) || null
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function normalizeSections(sections: Article["sections"] = []): Article["sections"] {
  return sections
    .map((section) => ({
      heading: String(section?.heading || "").trim(),
      paragraphs: Array.isArray(section?.paragraphs) ? section.paragraphs.map((paragraph) => String(paragraph || "").trim()).filter(Boolean) : [],
    }))
    .filter((section) => section.heading || section.paragraphs.length > 0)
}
