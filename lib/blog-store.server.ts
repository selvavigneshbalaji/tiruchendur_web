import fs from "node:fs/promises"
import path from "node:path"
import { articles as defaultArticles, type Article } from "@/app/blog/articles"

export type BlogPost = Article & {
  slug: string
  image?: string
}

export type BlogInput = {
  title: string
  slug?: string
  description?: string
  publishedTime?: string
  intro?: string
  image?: string
  sections?: { heading: string; paragraphs: string[] }[]
}

const BLOG_DATA_PATH = path.join(process.cwd(), "data", "blog-posts.json")

export const defaultBlogPosts: BlogPost[] = Object.entries(defaultArticles).map(([slug, article]) => ({
  ...article,
  slug,
  image: "/images/temple-hero.png",
}))

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

function normalizePost(post: BlogInput & { slug?: string }): BlogPost {
  const slug = slugify(post.slug || post.title || "untitled")
  const title = String(post.title || "Untitled blog").trim()
  const description = String(post.description || title).trim()
  const intro = String(post.intro || "").trim()
  const image = String(post.image || "/images/temple-hero.png").trim()

  return {
    slug,
    title,
    description,
    publishedTime: String(post.publishedTime || new Date().toISOString().slice(0, 10)),
    intro: intro || "",
    image: image || "/images/temple-hero.png",
    sections: normalizeSections((post.sections || []) as Article["sections"]),
  }
}

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(BLOG_DATA_PATH), { recursive: true })
  try {
    await fs.access(BLOG_DATA_PATH)
  } catch {
    await fs.writeFile(BLOG_DATA_PATH, JSON.stringify([], null, 2), "utf8")
  }
}

async function readStoredPosts(): Promise<BlogPost[]> {
  await ensureStoreFile()
  const raw = await fs.readFile(BLOG_DATA_PATH, "utf8")
  try {
    const parsed = JSON.parse(raw) as BlogInput[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((post) => normalizePost(post))
  } catch {
    return []
  }
}

async function writeStoredPosts(posts: BlogPost[]) {
  await ensureStoreFile()
  await fs.writeFile(BLOG_DATA_PATH, JSON.stringify(posts.map((post) => normalizePost(post)), null, 2), "utf8")
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  const customPosts = await readStoredPosts()
  const merged = new Map<string, BlogPost>()

  for (const post of defaultBlogPosts) merged.set(post.slug, post)
  for (const post of customPosts) merged.set(post.slug, post)

  return Array.from(merged.values()).sort((a, b) => new Date(b.publishedTime).getTime() - new Date(a.publishedTime).getTime())
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await listBlogPosts()
  return posts.find((post) => post.slug === slug) || null
}

export async function addBlogPost(input: BlogInput): Promise<BlogPost> {
  const posts = await readStoredPosts()
  const next = normalizePost({ ...input, slug: input.slug || input.title })
  const withoutSameSlug = posts.filter((post) => post.slug !== next.slug)
  const updated = [...withoutSameSlug, next]
  await writeStoredPosts(updated)
  return next
}

export async function updateBlogPost(slug: string, input: BlogInput): Promise<BlogPost> {
  const posts = await readStoredPosts()
  const targetSlug = slugify(slug || input.slug || input.title || "untitled")
  const updated = posts.filter((post) => post.slug !== targetSlug)
  const next = normalizePost({ ...input, slug: input.slug || targetSlug })
  await writeStoredPosts([...updated, next])
  return next
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  const posts = await readStoredPosts()
  const filtered = posts.filter((post) => post.slug !== slugify(slug))
  if (filtered.length === posts.length) return false
  await writeStoredPosts(filtered)
  return true
}
