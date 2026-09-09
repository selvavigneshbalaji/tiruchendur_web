"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { defaultBlogPosts, getAllBlogPosts, slugify, type BlogPost } from "@/lib/blog-data"

type BlogFormState = {
  title: string
  slug: string
  description: string
  publishedTime: string
  intro: string
  image: string
  sections: { heading: string; paragraphs: string[] }[]
}

const emptySection = () => ({ heading: "", paragraphs: [""] })

const emptyForm: BlogFormState = {
  title: "",
  slug: "",
  description: "",
  publishedTime: new Date().toISOString().slice(0, 10),
  intro: "",
  image: "/images/temple-hero.png",
  sections: [emptySection()],
}

function normalizeParagraphs(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function AdminBlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [form, setForm] = useState<BlogFormState>(emptyForm)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/portal/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unauthorized")
        const data = await response.json() as { user?: { role?: string } }
        if (data.user?.role !== "admin") {
          window.location.href = "/admin"
          return
        }
        const nextPosts = await getAllBlogPosts()
        setPosts(nextPosts)
      })
      .catch(() => {
        window.location.href = "/admin"
      })
  }, [])

  const defaultCount = useMemo(() => defaultBlogPosts.length, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingSlug(null)
    setShowForm(false)
  }

  function beginAdd() {
    setForm(emptyForm)
    setEditingSlug(null)
    setShowForm(true)
    setMessage("")
    setError("")
  }

  function beginEdit(post: BlogPost) {
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      publishedTime: post.publishedTime,
      intro: post.intro,
      image: post.image || "/images/temple-hero.png",
      sections: post.sections?.length ? post.sections.map((section) => ({ heading: section.heading, paragraphs: [...section.paragraphs] })) : [emptySection()],
    })
    setEditingSlug(post.slug)
    setShowForm(true)
    setMessage("")
    setError("")
  }

  function updateSection(index: number, field: "heading" | "paragraphs", value: string | string[]) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => {
        if (sectionIndex !== index) return section
        return {
          ...section,
          [field]: field === "paragraphs" ? Array.isArray(value) ? value : [value] : value,
        }
      }),
    }))
  }

  function addSection() {
    setForm((current) => ({ ...current, sections: [...current.sections, emptySection()] }))
  }

  function removeSection(index: number) {
    setForm((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }))
  }

  function savePost() {
    if (!form.title.trim()) {
      setError("Please add a blog title.")
      return
    }

    const title = form.title.trim()
    const slug = (form.slug.trim() || title).trim()
    const generatedSlug = slugify(slug)
    const normalizedSections = form.sections
      .map((section) => ({
        heading: section.heading.trim(),
        paragraphs: normalizeParagraphs(section.paragraphs.join("\n")),
      }))
      .filter((section) => section.heading || section.paragraphs.length)

    if (!normalizedSections.length) {
      setError("Add at least one content section.")
      return
    }

    const body = {
      title,
      slug: generatedSlug,
      description: form.description.trim() || title,
      publishedTime: form.publishedTime || new Date().toISOString().slice(0, 10),
      intro: form.intro.trim() || normalizedSections[0].paragraphs[0] || "",
      image: form.image.trim() || "/images/temple-hero.png",
      sections: normalizedSections,
    }

    fetch("/api/admin/blogs", {
      method: editingSlug ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, slug: generatedSlug }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as { error?: string; post?: BlogPost }
        if (!response.ok) throw new Error(data.error || "Could not save blog post.")
        const nextPosts = await getAllBlogPosts()
        setPosts(nextPosts)
        setMessage(editingSlug ? "Blog updated." : "Blog added.")
        resetForm()
        setError("")
      })
      .catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : "Could not save blog post.")
      })
  }

  function deletePost(slug: string) {
    if (!window.confirm("Delete this blog post?")) return

    fetch(`/api/admin/blogs?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as { error?: string }
        if (!response.ok) throw new Error(data.error || "Could not delete blog post.")
        const nextPosts = await getAllBlogPosts()
        setPosts(nextPosts)
        setMessage("Blog deleted.")
        if (editingSlug === slug) resetForm()
      })
      .catch((deleteError) => {
        setError(deleteError instanceof Error ? deleteError.message : "Could not delete blog post.")
      })
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
              <ArrowLeft /> Dashboard
            </Link>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Blog management</h1>
          </div>
          <Button type="button" onClick={beginAdd}>
            <Plus /> Add blog
          </Button>
        </div>

        {message && <p className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">{message}</p>}
        {error && <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        {showForm && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingSlug ? "Edit blog" : "Add blog"}</h2>
              <button type="button" onClick={resetForm} aria-label="Close form" className="rounded-full border border-border p-2 hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium md:col-span-2">
                Blog title
                <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3" />
              </label>

              <label className="block text-sm font-medium">
                Slug
                <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3" placeholder="travel-guide-example" />
              </label>

              <label className="block text-sm font-medium">
                Publish date
                <input type="date" value={form.publishedTime} onChange={(event) => setForm((current) => ({ ...current, publishedTime: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3" />
              </label>

              <label className="block text-sm font-medium md:col-span-2">
                Short description
                <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3" />
              </label>

              <label className="block text-sm font-medium md:col-span-2">
                Image URL
                <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3" placeholder="/images/temple-hero.png" />
              </label>

              <label className="block text-sm font-medium md:col-span-2">
                Intro
                <textarea value={form.intro} rows={3} onChange={(event) => setForm((current) => ({ ...current, intro: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2" />
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sections</h3>
                <Button type="button" variant="outline" onClick={addSection}>
                  <Plus /> Add section
                </Button>
              </div>

              {form.sections.map((section, index) => (
                <div key={index} className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Section {index + 1}</p>
                    {form.sections.length > 1 && (
                      <button type="button" onClick={() => removeSection(index)} className="rounded-full border border-border p-2 hover:bg-muted">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm font-medium">
                      Heading
                      <input value={section.heading} onChange={(event) => updateSection(index, "heading", event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3" />
                    </label>
                    <label className="block text-sm font-medium">
                      Paragraphs (one paragraph per line)
                      <textarea value={section.paragraphs.join("\n\n")} rows={4} onChange={(event) => updateSection(index, "paragraphs", event.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2" />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={savePost}>
                <Save /> {editingSlug ? "Update blog" : "Save blog"}
              </Button>
            </div>
          </div>
        )}

        <section className="mt-8 space-y-3">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No blog posts yet.</p>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={post.image || "/images/temple-hero.png"} alt={post.title} className="h-16 w-24 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">/blog/{post.slug}</p>
                    <p className="text-xs text-muted-foreground">{post.publishedTime}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => beginEdit(post)}>
                    <Pencil /> Edit
                  </Button>
                  <Link href={`/blog/${post.slug}`} className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                    View
                  </Link>
                  <Button type="button" size="sm" variant="destructive" onClick={() => deletePost(post.slug)}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </article>
            ))
          )}
        </section>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Default site articles: {defaultCount}. Custom admin posts are stored in the Cloudflare database and shown in the public blog section.
        </div>
      </div>
    </main>
  )
}
