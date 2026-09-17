const encoder = new TextEncoder()

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  })
}

function cors(request, env) {
  const origin = request.headers.get("Origin")
  return origin && origin === env.APP_ORIGIN
    ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", "Vary": "Origin" }
    : {}
}

function uuid() { return crypto.randomUUID() }

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value))
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("")
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 100000 }, key, 256)
  return [...new Uint8Array(bits)].map((value) => value.toString(16).padStart(2, "0")).join("")
}

async function safeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false
  const leftBytes = encoder.encode(left)
  const rightBytes = encoder.encode(right)
  let difference = 0
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index]
  return difference === 0
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.get("Cookie") || "").split(";").map((entry) => entry.trim().split("=")).filter(([key]) => key))
}

async function currentUser(request, env) {
  const token = parseCookies(request).ts_session
  if (!token) return null
  const tokenHash = await sha256(token)
  return env.DB.prepare(`SELECT users.id, users.username, users.role, users.hotel_id FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > datetime('now')`).bind(tokenHash).first()
}

function requireRole(user, ...roles) {
  return user && roles.includes(user.role)
}

function sessionCookie(token, env) {
  return `ts_session=${token}; Path=/; Domain=${env.COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
}

function clearSessionCookie(env) {
  return `ts_session=; Path=/; Domain=${env.COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

function userPayload(user) {
  return { id: user.id, username: user.username, role: user.role, hotelId: user.hotel_id }
}

function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function blogPostPayload(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description || post.title,
    publishedTime: post.published_time || post.publishedTime || new Date().toISOString().slice(0, 10),
    intro: post.intro || "",
    image: post.image || "/images/temple-hero.png",
    sections: Array.isArray(JSON.parse(post.sections || "[]")) ? JSON.parse(post.sections || "[]") : [],
  }
}

function hotelPayload(hotel) {
  return {
    id: hotel.id, name: hotel.name, slug: hotel.slug, area: hotel.area, description: hotel.description,
    category: hotel.category, price: hotel.price, maxGuests: hotel.max_guests, ownerName: hotel.owner_name,
    ownerContact: hotel.owner_contact, status: hotel.status, ownerUserId: hotel.owner_user_id,
  }
}

function roomPayload(room) {
  return {
    id: room.id, hotelId: room.hotel_id, name: room.name, description: room.description,
    maxGuests: room.max_guests, basePrice: room.base_price, status: room.status,
  }
}

function imagePayload(image) {
  return { id: image.id, hotelId: image.hotel_id, altText: image.alt_text, position: image.position, url: `/api/portal/images/${image.id}` }
}

async function handleLogin(request, env, headers) {
  const { username, password } = await request.json()
  if (!username || !password) return json({ error: "Username and password are required." }, 400, headers)
  const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(String(username).trim()).first()
  if (!user || !(await safeEqual(await passwordHash(String(password), user.password_salt), user.password_hash))) return json({ error: "Invalid username or password." }, 401, headers)
  const token = crypto.getRandomValues(new Uint8Array(32))
  const tokenValue = [...token].map((value) => value.toString(16).padStart(2, "0")).join("")
  await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+7 days'))").bind(uuid(), user.id, await sha256(tokenValue)).run()
  return json({ user: userPayload(user) }, 200, { ...headers, "Set-Cookie": sessionCookie(tokenValue, env) })
}

async function handleBootstrap(request, env, headers) {
  if (!env.BOOTSTRAP_TOKEN || !(await safeEqual(request.headers.get("X-Bootstrap-Token") || "", env.BOOTSTRAP_TOKEN))) return json({ error: "Not authorized." }, 401, headers)
  const exists = await env.DB.prepare("SELECT id FROM users LIMIT 1").first()
  if (exists) return json({ error: "Setup has already been completed." }, 409, headers)
  const { username, password } = await request.json()
  if (!username || String(password).length < 12) return json({ error: "Use a username and a password of at least 12 characters." }, 400, headers)
  const salt = uuid()
  await env.DB.prepare("INSERT INTO users (id, username, password_hash, password_salt, role) VALUES (?, ?, ?, ?, 'admin')").bind(uuid(), String(username).trim(), await passwordHash(String(password), salt), salt).run()
  return json({ ok: true }, 201, headers)
}

async function handleMe(request, env, headers) {
  const user = await currentUser(request, env)
  return user ? json({ user: userPayload(user) }, 200, headers) : json({ error: "Not signed in." }, 401, headers)
}

async function handleLogout(request, env, headers) {
  const token = parseCookies(request).ts_session
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run()
  return json({ ok: true }, 200, { ...headers, "Set-Cookie": clearSessionCookie(env) })
}

async function handleListHotels(env, headers) {
  const { results } = await env.DB.prepare("SELECT * FROM hotels ORDER BY created_at DESC").all()
  return json({ hotels: results.map(hotelPayload) }, 200, headers)
}

async function handlePublicHotel(request, env, headers) {
  const identifier = decodeURIComponent(new URL(request.url).pathname.split("/").pop() || "")
  const hotel = await env.DB.prepare("SELECT * FROM hotels WHERE id = ? OR slug = ?").bind(identifier, identifier).first()
  if (!hotel) return json({ error: "Property not found." }, 404, headers)
  const { results } = await env.DB.prepare("SELECT * FROM hotel_images WHERE hotel_id = ? ORDER BY position, created_at").bind(hotel.id).all()
  return json({ hotel: { ...hotelPayload(hotel), images: results.map(imagePayload) } }, 200, headers)
}

async function handlePublicHotels(env, headers) {
  const { results } = await env.DB.prepare("SELECT * FROM hotels WHERE status = 'published' ORDER BY created_at DESC").all()
  const { results: imageResults } = await env.DB.prepare("SELECT * FROM hotel_images ORDER BY position, created_at").all()
  const imagesByHotel = new Map()
  for (const image of imageResults) {
    const images = imagesByHotel.get(image.hotel_id) || []
    images.push(imagePayload(image))
    imagesByHotel.set(image.hotel_id, images)
  }
  return json({ hotels: results.map((hotel) => ({ ...hotelPayload(hotel), images: imagesByHotel.get(hotel.id) || [] })) }, 200, headers)
}

async function handleCreateHotel(request, env, headers) {
  const body = await request.json()
  const name = String(body.name || "").trim()
  const username = String(body.ownerUsername || "").trim()
  const password = String(body.ownerPassword || "")
  if (!name || !username || password.length < 12) return json({ error: "Property name, owner username, and a password of at least 12 characters are required." }, 400, headers)
  const id = uuid()
  const ownerId = uuid()
  const slug = slugify(body.slug || name)
  if (!slug) return json({ error: "A valid property slug is required." }, 400, headers)
  const salt = uuid()
  const hotel = {
    id, name, slug, area: String(body.area || "Tiruchendur").trim(), description: String(body.description || "").trim(),
    category: String(body.category || "Hotel").trim(), price: Math.max(0, Math.floor(Number(body.price) || 0)),
    maxGuests: Math.max(1, Math.floor(Number(body.maxGuests) || 1)), ownerName: String(body.ownerName || "Host").trim(),
    ownerContact: String(body.ownerContact || "").trim(), status: body.status === "published" ? "published" : "draft",
  }
  try {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO hotels (id, name, slug, area, description, category, price, max_guests, owner_name, owner_contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(hotel.id, hotel.name, hotel.slug, hotel.area, hotel.description, hotel.category, hotel.price, hotel.maxGuests, hotel.ownerName, hotel.ownerContact, hotel.status),
      env.DB.prepare("INSERT INTO users (id, username, password_hash, password_salt, role, hotel_id) VALUES (?, ?, ?, ?, 'owner', ?)").bind(ownerId, username, await passwordHash(password, salt), salt, id),
      env.DB.prepare("UPDATE hotels SET owner_user_id = ? WHERE id = ?").bind(ownerId, id),
    ])
  } catch (error) {
    if (String(error).includes("UNIQUE")) return json({ error: "That property slug or owner username is already in use." }, 409, headers)
    throw error
  }
  return json({ hotel: { ...hotel, ownerUserId: ownerId } }, 201, headers)
}

async function handleUpdateAdminHotel(request, env, headers, hotelId) {
  const hotel = await env.DB.prepare("SELECT * FROM hotels WHERE id = ?").bind(hotelId).first()
  if (!hotel) return json({ error: "Property not found." }, 404, headers)
  const body = await request.json()
  const next = {
    name: String(body.name ?? hotel.name).trim(), slug: String(body.slug ?? hotel.slug).trim(), area: String(body.area ?? hotel.area).trim(),
    description: String(body.description ?? hotel.description).trim(), category: String(body.category ?? hotel.category).trim(),
    price: Math.max(0, Math.floor(Number(body.price ?? hotel.price))), maxGuests: Math.max(1, Math.floor(Number(body.maxGuests ?? hotel.max_guests))),
    ownerName: String(body.ownerName ?? hotel.owner_name).trim(), ownerContact: String(body.ownerContact ?? hotel.owner_contact).trim(),
    status: ["draft", "published", "archived"].includes(body.status) ? body.status : hotel.status,
  }
  if (!next.name || !next.slug || !next.area || !next.category || !next.ownerName || !next.ownerContact) return json({ error: "Required property details are missing." }, 400, headers)
  try {
    await env.DB.prepare("UPDATE hotels SET name = ?, slug = ?, area = ?, description = ?, category = ?, price = ?, max_guests = ?, owner_name = ?, owner_contact = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(next.name, next.slug, next.area, next.description, next.category, next.price, next.maxGuests, next.ownerName, next.ownerContact, next.status, hotelId).run()
  } catch (error) {
    if (String(error).includes("UNIQUE")) return json({ error: "That property slug is already in use." }, 409, headers)
    throw error
  }
  return json({ hotel: { ...hotelPayload(hotel), ...next, ownerUserId: hotel.owner_user_id } }, 200, headers)
}

async function handleDeleteAdminHotel(env, headers, hotelId) {
  const hotel = await env.DB.prepare("SELECT id FROM hotels WHERE id = ?").bind(hotelId).first()
  if (!hotel) return json({ error: "Property not found." }, 404, headers)
  const { results } = await env.DB.prepare("SELECT object_key FROM hotel_images WHERE hotel_id = ?").bind(hotelId).all()
  await Promise.all(results.map((image) => env.PHOTOS.delete(image.object_key)))
  try {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM availability WHERE hotel_id = ?").bind(hotelId),
      env.DB.prepare("DELETE FROM hotel_images WHERE hotel_id = ?").bind(hotelId),
      env.DB.prepare("DELETE FROM rooms WHERE hotel_id = ?").bind(hotelId),
      env.DB.prepare("DELETE FROM hotels WHERE id = ?").bind(hotelId),
    ])
  } catch (error) {
    if (String(error).includes("FOREIGN KEY")) return json({ error: "This property cannot be deleted because it has bookings." }, 409, headers)
    throw error
  }
  return json({ ok: true }, 200, headers)
}

async function handleListBlogPosts(env, headers) {
  const { results } = await env.DB.prepare("SELECT * FROM blog_posts ORDER BY published_time DESC, created_at DESC").all()
  return json({ posts: results.map(blogPostPayload) }, 200, headers)
}

async function handleCreateBlogPost(request, user, env, headers) {
  if (!user || user.role !== "admin") return json({ error: "Admin access required." }, 403, headers)
  const body = await request.json()
  const title = String(body.title || "").trim()
  const slug = slugify(String(body.slug || title || "untitled"))
  const sections = Array.isArray(body.sections) ? body.sections : []
  if (!title) return json({ error: "Title is required." }, 400, headers)
  if (!slug) return json({ error: "A valid slug is required." }, 400, headers)
  const publishedTime = String(body.publishedTime || body.published_time || new Date().toISOString().slice(0, 10)).trim()
  const post = {
    id: uuid(),
    title,
    slug,
    description: String(body.description || title).trim(),
    published_time: publishedTime,
    intro: String(body.intro || "").trim(),
    image: String(body.image || "/images/temple-hero.png").trim(),
    sections: JSON.stringify(sections.map((section) => ({ heading: String(section?.heading || "").trim(), paragraphs: Array.isArray(section?.paragraphs) ? section.paragraphs.map((paragraph) => String(paragraph || "").trim()).filter(Boolean) : [] })))
  }
  await env.DB.prepare("INSERT INTO blog_posts (id, title, slug, description, published_time, intro, image, sections) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(post.id, post.title, post.slug, post.description, post.published_time, post.intro, post.image, post.sections).run()
  return json({ post: blogPostPayload(post) }, 201, headers)
}

async function handleUpdateBlogPost(request, user, env, headers) {
  if (!user || user.role !== "admin") return json({ error: "Admin access required." }, 403, headers)
  const body = await request.json()
  const slug = String(body.slug || "").trim()
  if (!slug) return json({ error: "Blog slug is required." }, 400, headers)
  const existing = await env.DB.prepare("SELECT * FROM blog_posts WHERE slug = ?").bind(slug).first()
  // Default site articles live in the app until an admin edits one. On its
  // first edit, create its D1 copy; subsequent edits update that same record.
  if (!existing) {
    const createHeaders = new Headers(request.headers)
    createHeaders.delete("content-length")
    createHeaders.set("content-type", "application/json")
    return handleCreateBlogPost(new Request(request.url, {
      method: "POST",
      headers: createHeaders,
      body: JSON.stringify(body),
    }), user, env, headers)
  }
  const title = String(body.title || existing.title).trim()
  const nextSlug = slugify(String(body.slug || existing.slug || title || "untitled"))
  const sections = Array.isArray(body.sections) ? body.sections : JSON.parse(existing.sections || "[]")
  const post = {
    id: existing.id,
    title,
    slug: nextSlug,
    description: String(body.description || existing.description || title).trim(),
    published_time: String(body.publishedTime || body.published_time || existing.published_time || new Date().toISOString().slice(0, 10)).trim(),
    intro: String(body.intro || existing.intro || "").trim(),
    image: String(body.image || existing.image || "/images/temple-hero.png").trim(),
    sections: JSON.stringify(sections.map((section) => ({ heading: String(section?.heading || "").trim(), paragraphs: Array.isArray(section?.paragraphs) ? section.paragraphs.map((paragraph) => String(paragraph || "").trim()).filter(Boolean) : [] })))
  }
  await env.DB.prepare("UPDATE blog_posts SET title = ?, slug = ?, description = ?, published_time = ?, intro = ?, image = ?, sections = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(post.title, post.slug, post.description, post.published_time, post.intro, post.image, post.sections, post.id).run()
  return json({ post: blogPostPayload(post) }, 200, headers)
}

async function handleDeleteBlogPost(request, user, env, headers) {
  if (!user || user.role !== "admin") return json({ error: "Admin access required." }, 403, headers)
  const slug = String(new URL(request.url).searchParams.get("slug") || "").trim()
  if (!slug) return json({ error: "Blog slug is required." }, 400, headers)
  const result = await env.DB.prepare("DELETE FROM blog_posts WHERE slug = ?").bind(slugify(slug)).run()
  return json({ success: result.success !== false }, 200, headers)
}

async function handleOwnerHotel(user, env, headers) {
  const hotel = await env.DB.prepare("SELECT * FROM hotels WHERE id = ?").bind(user.hotel_id).first()
  return hotel ? json({ hotel: hotelPayload(hotel) }, 200, headers) : json({ error: "No property is assigned to this account." }, 404, headers)
}

async function handleUpdateOwnerHotel(request, user, env, headers) {
  const body = await request.json()
  const hotel = await env.DB.prepare("SELECT * FROM hotels WHERE id = ?").bind(user.hotel_id).first()
  if (!hotel) return json({ error: "No property is assigned to this account." }, 404, headers)
  const next = {
    name: String(body.name ?? hotel.name).trim(), area: String(body.area ?? hotel.area).trim(), description: String(body.description ?? hotel.description).trim(),
    category: String(body.category ?? hotel.category).trim(), price: Math.max(0, Math.floor(Number(body.price ?? hotel.price))),
    maxGuests: Math.max(1, Math.floor(Number(body.maxGuests ?? hotel.max_guests))), ownerName: String(body.ownerName ?? hotel.owner_name).trim(),
    ownerContact: String(body.ownerContact ?? hotel.owner_contact).trim(), status: body.status === "published" ? "published" : "draft",
  }
  await env.DB.prepare("UPDATE hotels SET name = ?, area = ?, description = ?, category = ?, price = ?, max_guests = ?, owner_name = ?, owner_contact = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(next.name, next.area, next.description, next.category, next.price, next.maxGuests, next.ownerName, next.ownerContact, next.status, hotel.id).run()
  return json({ hotel: { ...hotelPayload(hotel), ...next } }, 200, headers)
}

async function hotelForUser(user, env, hotelId) {
  const id = user.role === "admin" ? hotelId : user.hotel_id
  return id ? env.DB.prepare("SELECT * FROM hotels WHERE id = ?").bind(id).first() : null
}

async function handleListRooms(user, request, env, headers) {
  const hotel = await hotelForUser(user, env, new URL(request.url).searchParams.get("hotelId"))
  if (!hotel) return json({ error: "Property not found." }, 404, headers)
  const { results } = await env.DB.prepare("SELECT * FROM rooms WHERE hotel_id = ? ORDER BY created_at DESC").bind(hotel.id).all()
  return json({ rooms: results.map(roomPayload) }, 200, headers)
}

async function handleCreateRoom(request, user, env, headers) {
  const body = await request.json()
  const hotel = await hotelForUser(user, env, body.hotelId)
  if (!hotel) return json({ error: "Property not found." }, 404, headers)
  const name = String(body.name || "").trim()
  const maxGuests = Math.floor(Number(body.maxGuests))
  const basePrice = Math.floor(Number(body.basePrice))
  if (!name || maxGuests < 1 || basePrice < 0) return json({ error: "Room name, guest capacity, and a valid price are required." }, 400, headers)
  const room = { id: uuid(), hotel_id: hotel.id, name, description: String(body.description || "").trim(), max_guests: maxGuests, base_price: basePrice, status: body.status === "inactive" ? "inactive" : "active" }
  await env.DB.prepare("INSERT INTO rooms (id, hotel_id, name, description, max_guests, base_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(room.id, room.hotel_id, room.name, room.description, room.max_guests, room.base_price, room.status).run()
  return json({ room: roomPayload(room) }, 201, headers)
}

async function handleUpdateRoom(request, user, env, headers, roomId) {
  const body = await request.json()
  const room = await env.DB.prepare("SELECT rooms.* FROM rooms JOIN hotels ON hotels.id = rooms.hotel_id WHERE rooms.id = ? AND (? = 'admin' OR hotels.id = ?)").bind(roomId, user.role, user.hotel_id).first()
  if (!room) return json({ error: "Room not found." }, 404, headers)
  const next = {
    name: String(body.name ?? room.name).trim(), description: String(body.description ?? room.description).trim(),
    maxGuests: Math.max(1, Math.floor(Number(body.maxGuests ?? room.max_guests))), basePrice: Math.max(0, Math.floor(Number(body.basePrice ?? room.base_price))),
    status: body.status === "inactive" ? "inactive" : "active",
  }
  await env.DB.prepare("UPDATE rooms SET name = ?, description = ?, max_guests = ?, base_price = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(next.name, next.description, next.maxGuests, next.basePrice, next.status, roomId).run()
  return json({ room: { ...roomPayload(room), ...next } }, 200, headers)
}

async function handleDeleteRoom(request, user, env, headers, roomId) {
  const room = await env.DB.prepare("SELECT rooms.id FROM rooms JOIN hotels ON hotels.id = rooms.hotel_id WHERE rooms.id = ? AND (? = 'admin' OR hotels.id = ?)").bind(roomId, user.role, user.hotel_id).first()
  if (!room) return json({ error: "Room not found." }, 404, headers)
  await env.DB.prepare("DELETE FROM rooms WHERE id = ?").bind(roomId).run()
  return json({ ok: true }, 200, headers)
}

async function handleRoomPrice(request, user, env, headers, roomId) {
  const body = await request.json()
  const room = await env.DB.prepare("SELECT rooms.* FROM rooms JOIN hotels ON hotels.id = rooms.hotel_id WHERE rooms.id = ? AND (? = 'admin' OR hotels.id = ?)").bind(roomId, user.role, user.hotel_id).first()
  if (!room) return json({ error: "Room not found." }, 404, headers)
  const date = String(body.date || "")
  const price = Math.floor(Number(body.price))
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || price < 0) return json({ error: "A valid date and non-negative price are required." }, 400, headers)
  await env.DB.prepare("INSERT INTO room_prices (room_id, stay_date, price, available) VALUES (?, ?, ?, ?) ON CONFLICT(room_id, stay_date) DO UPDATE SET price = excluded.price, available = excluded.available, updated_at = CURRENT_TIMESTAMP").bind(roomId, date, price, body.available === false ? 0 : 1).run()
  return json({ ok: true, roomId, date, price, available: body.available !== false }, 200, headers)
}

async function handleBulkRoomPrice(request, user, env, headers) {
  const body = await request.json()
  const hotel = await hotelForUser(user, env, body.hotelId)
  const from = String(body.from || "")
  const to = String(body.to || from)
  const price = Math.floor(Number(body.price))
  if (!hotel || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to || price < 0) return json({ error: "Property, valid date range, and non-negative price are required." }, 400, headers)
  const { results } = await env.DB.prepare("SELECT id FROM rooms WHERE hotel_id = ? AND status = 'active'").bind(hotel.id).all()
  if (!results.length) return json({ error: "No active rooms found for this property." }, 400, headers)
  const start = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  const statements = []
  for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    const stayDate = date.toISOString().slice(0, 10)
    for (const room of results) statements.push(env.DB.prepare("INSERT INTO room_prices (room_id, stay_date, price, available) VALUES (?, ?, ?, ?) ON CONFLICT(room_id, stay_date) DO UPDATE SET price = excluded.price, available = excluded.available, updated_at = CURRENT_TIMESTAMP").bind(room.id, stayDate, price, body.available === false ? 0 : 1))
  }
  await env.DB.batch(statements)
  return json({ ok: true, from, to, price, available: body.available !== false, roomsUpdated: results.length, datesUpdated: statements.length / results.length }, 200, headers)
}

async function handleListRoomPrices(request, user, env, headers, roomId) {
  const room = await env.DB.prepare("SELECT rooms.* FROM rooms JOIN hotels ON hotels.id = rooms.hotel_id WHERE rooms.id = ? AND (? = 'admin' OR hotels.id = ?)").bind(roomId, user.role, user.hotel_id).first()
  if (!room) return json({ error: "Room not found." }, 404, headers)
  const params = new URL(request.url).searchParams
  const from = params.get("from") || new Date().toISOString().slice(0, 10)
  const to = params.get("to") || "9999-12-31"
  const { results } = await env.DB.prepare("SELECT stay_date AS date, price, available FROM room_prices WHERE room_id = ? AND stay_date BETWEEN ? AND ? ORDER BY stay_date").bind(roomId, from, to).all()
  return json({ prices: results }, 200, headers)
}

async function handleListImages(user, request, env, headers) {
  const hotel = await hotelForUser(user, env, new URL(request.url).searchParams.get("hotelId"))
  if (!hotel) return json({ error: "Property not found." }, 404, headers)
  const { results } = await env.DB.prepare("SELECT * FROM hotel_images WHERE hotel_id = ? ORDER BY position, created_at").bind(hotel.id).all()
  return json({ images: results.map(imagePayload) }, 200, headers)
}

async function handleUploadImage(request, user, env, headers) {
  const form = await request.formData()
  const hotel = await hotelForUser(user, env, form.get("hotelId"))
  const file = form.get("file")
  if (!hotel || !(file instanceof File)) return json({ error: "Property and image file are required." }, 400, headers)
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return json({ error: "Upload an image smaller than 10 MB." }, 400, headers)
  const imageId = uuid()
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  const objectKey = `properties/${hotel.id}/${imageId}.${extension}`
  await env.PHOTOS.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } })
  const position = Number(form.get("position") || 0)
  await env.DB.prepare("INSERT INTO hotel_images (id, hotel_id, object_key, alt_text, position) VALUES (?, ?, ?, ?, ?)").bind(imageId, hotel.id, objectKey, String(form.get("altText") || hotel.name), position).run()
  return json({ image: { id: imageId, hotelId: hotel.id, altText: String(form.get("altText") || hotel.name), position, url: `/api/portal/images/${imageId}` } }, 201, headers)
}

async function handleGetImage(request, env) {
  const image = await env.DB.prepare("SELECT object_key FROM hotel_images WHERE id = ?").bind(new URL(request.url).pathname.split("/").pop()).first()
  if (!image) return new Response("Not found", { status: 404 })
  const object = await env.PHOTOS.get(image.object_key)
  if (!object) return new Response("Not found", { status: 404 })
  return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } })
}

async function handleDeleteImage(request, user, env, headers) {
  const imageId = new URL(request.url).pathname.split("/").pop()
  const image = await env.DB.prepare("SELECT hotel_images.*, hotels.id AS hotel_id FROM hotel_images JOIN hotels ON hotels.id = hotel_images.hotel_id WHERE hotel_images.id = ? AND (? = 'admin' OR hotels.id = ?)").bind(imageId, user.role, user.hotel_id).first()
  if (!image) return json({ error: "Image not found." }, 404, headers)
  await env.PHOTOS.delete(image.object_key)
  await env.DB.prepare("DELETE FROM hotel_images WHERE id = ?").bind(imageId).run()
  return json({ ok: true }, 200, headers)
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env)
    if (request.method === "OPTIONS") return new Response(null, { headers: { ...headers, "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Bootstrap-Token" } })
    const path = new URL(request.url).pathname
    try {
      if (request.method === "GET" && path === "/health") return json({ ok: true }, 200, headers)
      if (request.method === "GET" && path === "/hotels") return handlePublicHotels(env, headers)
      if (request.method === "GET" && path.startsWith("/hotels/")) return handlePublicHotel(request, env, headers)
      if (request.method === "GET" && path === "/admin/blogs") return handleListBlogPosts(env, headers)
      if (request.method === "POST" && path === "/setup") return handleBootstrap(request, env, headers)
      if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env, headers)
      if (request.method === "GET" && path === "/auth/me") return handleMe(request, env, headers)
      if (request.method === "POST" && path === "/auth/logout") return handleLogout(request, env, headers)
      if (request.method === "GET" && path.startsWith("/images/")) return handleGetImage(request, env)
      const user = await currentUser(request, env)
      if (!user) return json({ error: "Not signed in." }, 401, headers)
      if (path.startsWith("/admin/") && !requireRole(user, "admin")) return json({ error: "Admin access required." }, 403, headers)
      if (path.startsWith("/owner/") && !requireRole(user, "admin", "owner")) return json({ error: "Owner access required." }, 403, headers)
      if (request.method === "GET" && path === "/admin/hotels") return handleListHotels(env, headers)
      if (request.method === "POST" && path === "/admin/blogs") return handleCreateBlogPost(request, user, env, headers)
      if (request.method === "PATCH" && path === "/admin/blogs") return handleUpdateBlogPost(request, user, env, headers)
      if (request.method === "DELETE" && path === "/admin/blogs") return handleDeleteBlogPost(request, user, env, headers)
      if (request.method === "POST" && path === "/admin/hotels") return handleCreateHotel(request, env, headers)
      if (request.method === "DELETE" && path.startsWith("/admin/hotels/")) return handleDeleteAdminHotel(env, headers, path.split("/").pop())
      if (request.method === "PATCH" && path.startsWith("/admin/hotels/")) return handleUpdateAdminHotel(request, env, headers, path.split("/").pop())
      if (request.method === "GET" && path === "/admin/rooms") return handleListRooms(user, request, env, headers)
      if (request.method === "POST" && path === "/admin/rooms") return handleCreateRoom(request, user, env, headers)
      if (request.method === "PATCH" && path.startsWith("/admin/rooms/")) return handleUpdateRoom(request, user, env, headers, path.split("/").pop())
      if (request.method === "DELETE" && path.startsWith("/admin/rooms/")) return handleDeleteRoom(request, user, env, headers, path.split("/").pop())
      if (request.method === "GET" && path.startsWith("/admin/rooms/") && path.endsWith("/prices")) return handleListRoomPrices(request, user, env, headers, path.split("/")[3])
      if (request.method === "POST" && path.startsWith("/admin/rooms/") && path.endsWith("/prices")) return handleRoomPrice(request, user, env, headers, path.split("/")[3])
      if (request.method === "POST" && path === "/admin/rooms/bulk-prices") return handleBulkRoomPrice(request, user, env, headers)
      if (request.method === "GET" && path === "/admin/images") return handleListImages(user, request, env, headers)
      if (request.method === "POST" && path === "/admin/images") return handleUploadImage(request, user, env, headers)
      if (request.method === "DELETE" && path.startsWith("/admin/images/")) return handleDeleteImage(request, user, env, headers)
      if (request.method === "GET" && path === "/owner/hotel") return handleOwnerHotel(user, env, headers)
      if (request.method === "PATCH" && path === "/owner/hotel") return handleUpdateOwnerHotel(request, user, env, headers)
      if (request.method === "GET" && path === "/owner/rooms") return handleListRooms(user, request, env, headers)
      if (request.method === "POST" && path === "/owner/rooms") return handleCreateRoom(request, user, env, headers)
      if (request.method === "PATCH" && path.startsWith("/owner/rooms/")) return handleUpdateRoom(request, user, env, headers, path.split("/").pop())
      if (request.method === "DELETE" && path.startsWith("/owner/rooms/")) return handleDeleteRoom(request, user, env, headers, path.split("/").pop())
      if (request.method === "GET" && path.startsWith("/owner/rooms/") && path.endsWith("/prices")) return handleListRoomPrices(request, user, env, headers, path.split("/")[3])
      if (request.method === "POST" && path.startsWith("/owner/rooms/") && path.endsWith("/prices")) return handleRoomPrice(request, user, env, headers, path.split("/")[3])
      if (request.method === "POST" && path === "/owner/rooms/bulk-prices") return handleBulkRoomPrice(request, user, env, headers)
      if (request.method === "GET" && path === "/owner/images") return handleListImages(user, request, env, headers)
      if (request.method === "POST" && path === "/owner/images") return handleUploadImage(request, user, env, headers)
      if (request.method === "DELETE" && path.startsWith("/owner/images/")) return handleDeleteImage(request, user, env, headers)
      return json({ error: "Not found." }, 404, headers)
    } catch (error) {
      console.error(error)
      return json({ error: "Unexpected server error." }, 500, headers)
    }
  },
}
