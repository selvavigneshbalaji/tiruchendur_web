"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Hotel = {
  id: string;
  name: string;
  slug: string;
  area: string;
  description: string;
  category: string;
  price: number;
  maxGuests: number;
  ownerName: string;
  ownerContact: string;
  status: "draft" | "published" | "archived";
  ownerUserId: string | null;
};
type FormState = Omit<Hotel, "id" | "ownerUserId"> & {
  ownerUsername: string;
  ownerPassword: string;
};
const emptyForm: FormState = {
  name: "",
  slug: "",
  area: "Tiruchendur",
  description: "",
  category: "Hotel",
  price: 0,
  maxGuests: 2,
  ownerName: "",
  ownerContact: "",
  status: "draft",
  ownerUsername: "",
  ownerPassword: "",
};
async function readJson<T>(response: Response) {
  return response.json().catch(() => ({})) as Promise<T>;
}
function editForm(hotel: Hotel): FormState {
  return { ...hotel, ownerUsername: "", ownerPassword: "" };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function loadHotels() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/portal/admin/hotels", {
      cache: "no-store",
    });
    const data = await readJson<{ hotels?: Hotel[]; error?: string }>(response);
    if (response.status === 401) {
      router.replace("/admin");
      return;
    }
    if (!response.ok) setError(data.error || "Could not load properties.");
    else setHotels(data.hotels || []);
    setLoading(false);
  }
  useEffect(() => {
    fetch("/api/portal/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unauthorized")
        const data = await response.json() as { user?: { role?: string } }
        if (data.user?.role !== "admin") {
          router.replace("/admin")
          return
        }
        void loadHotels()
      })
      .catch(() => {
        router.replace("/admin")
      })
  }, [router])
  function updateForm(field: keyof FormState, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }));
  }
  function startEdit(hotel: Hotel) {
    setEditingId(hotel.id);
    setForm(editForm(hotel));
    setShowForm(true);
    setError("");
    setMessage("");
  }
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }
  async function saveHotel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const url = editingId
      ? `/api/portal/admin/hotels/${editingId}`
      : "/api/portal/admin/hotels";
    const response = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await readJson<{ hotel?: Hotel; error?: string }>(response);
    if (!response.ok || !data.hotel)
      setError(data.error || "Could not save the property.");
    else {
      setHotels((current) =>
        editingId
          ? current.map((hotel) =>
              hotel.id === editingId ? (data.hotel as Hotel) : hotel,
            )
          : [data.hotel as Hotel, ...current],
      );
      cancelEdit();
      setMessage(editingId ? "Property updated." : "Property created.");
    }
    setSaving(false);
  }
  async function deleteHotel(hotel: Hotel) {
    if (!window.confirm(`Delete ${hotel.name}? This cannot be undone.`)) return;
    setError("");
    const response = await fetch(`/api/portal/admin/hotels/${hotel.id}`, {
      method: "DELETE",
    });
    const data = await readJson<{ error?: string }>(response);
    if (!response.ok) setError(data.error || "Could not delete the property.");
    else {
      setHotels((current) => current.filter((item) => item.id !== hotel.id));
      setMessage("Property deleted.");
    }
  }
  async function logout() {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Tiruchendur Stays
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold">
              Admin dashboard
            </h1>
          </div>
          <Button type="button" variant="outline" onClick={logout}>
            <LogOut /> Sign out
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft /> Back to admin
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Home /> Home
          </Link>
          <Link
            href="/admin/dashboard/rooms"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Building2 /> Rooms & photos
          </Link>
          <Link
            href="/admin/dashboard/blogs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <Pencil /> Blog posts
          </Link>
        </nav>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">
              Manage the properties shown on the booking site.
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Properties ({hotels.length})
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadHotels()}
              disabled={loading}
            >
              <RefreshCw /> Refresh
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm(true);
              }}
            >
              <Plus /> Add property
            </Button>
          </div>
        </div>
        {message && (
          <p className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {showForm && (
          <form
            onSubmit={saveHotel}
            className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit property" : "Add property"}
              </h3>
              <button type="button" onClick={cancelEdit} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Property name"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
                required
              />
              <Field
                label="Slug"
                value={form.slug}
                onChange={(value) => updateForm("slug", value)}
                required
              />
              <Field
                label="Area"
                value={form.area}
                onChange={(value) => updateForm("area", value)}
                required
              />
              <Field
                label="Category"
                value={form.category}
                onChange={(value) => updateForm("category", value)}
                required
              />
              <Field
                label="Starting price (INR)"
                type="number"
                min="0"
                value={form.price}
                onChange={(value) => updateForm("price", Number(value))}
                required
              />
              <Field
                label="Maximum guests"
                type="number"
                min="1"
                value={form.maxGuests}
                onChange={(value) => updateForm("maxGuests", Number(value))}
                required
              />
              <Field
                label="Owner name"
                value={form.ownerName}
                onChange={(value) => updateForm("ownerName", value)}
                required
              />
              <Field
                label="Owner contact"
                value={form.ownerContact}
                onChange={(value) => updateForm("ownerContact", value)}
                required
              />
              {!editingId && (
                <>
                  <Field
                    label="Owner username"
                    value={form.ownerUsername}
                    onChange={(value) => updateForm("ownerUsername", value)}
                    autoComplete="username"
                    required
                  />
                  <Field
                    label="Owner password"
                    type="password"
                    value={form.ownerPassword}
                    onChange={(value) => updateForm("ownerPassword", value)}
                    autoComplete="new-password"
                    minLength={12}
                    required
                  />
                </>
              )}
              <label className="block text-sm font-medium">
                Listing status
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value as FormState["status"],
                    )
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published / Live</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save /> {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        )}
        <section className="mt-6 grid gap-3">
          {loading ? (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Loading properties...
            </p>
          ) : hotels.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No properties yet.
            </p>
          ) : (
            hotels.map((hotel) => (
              <article
                key={hotel.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{hotel.name}</h3>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
                      {hotel.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hotel.area} · {hotel.category} · From ₹
                    {hotel.price.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm">Owner: {hotel.ownerName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(hotel)}
                  >
                    <Pencil /> Edit
                  </Button>
                  <Link
                    href={`/properties/${hotel.id}?from=admin`}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium hover:bg-muted"
                  >
                    View listing <ArrowRight className="size-4" />
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void deleteHotel(hotel)}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  [key: string]: unknown;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus:border-primary"
        {...props}
      />
    </label>
  );
}
