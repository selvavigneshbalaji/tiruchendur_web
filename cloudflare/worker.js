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
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 310000 }, key, 256)
  return [...new Uint8Array(bits)].map((value) => value.toString(16).padStart(2, "0")).join("")
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

async function handleLogin(request, env, headers) {
  const { username, password } = await request.json()
  if (!username || !password) return json({ error: "Username and password are required." }, 400, headers)
  const user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(String(username).trim()).first()
  if (!user || (await passwordHash(String(password), user.password_salt)) !== user.password_hash) return json({ error: "Invalid username or password." }, 401, headers)
  const token = crypto.getRandomValues(new Uint8Array(32))
  const tokenValue = [...token].map((value) => value.toString(16).padStart(2, "0")).join("")
  await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+7 days'))").bind(uuid(), user.id, await sha256(tokenValue)).run()
  return json({ user: { id: user.id, username: user.username, role: user.role, hotelId: user.hotel_id } }, 200, { ...headers, "Set-Cookie": sessionCookie(tokenValue, env) })
}

async function handleBootstrap(request, env, headers) {
  if (!env.BOOTSTRAP_TOKEN || request.headers.get("X-Bootstrap-Token") !== env.BOOTSTRAP_TOKEN) return json({ error: "Not authorized." }, 401, headers)
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
  return user ? json({ user: { id: user.id, username: user.username, role: user.role, hotelId: user.hotel_id } }, 200, headers) : json({ error: "Not signed in." }, 401, headers)
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env)
    if (request.method === "OPTIONS") return new Response(null, { headers: { ...headers, "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Bootstrap-Token" } })
    const path = new URL(request.url).pathname
    try {
      if (request.method === "GET" && path === "/health") return json({ ok: true }, 200, headers)
      if (request.method === "POST" && path === "/setup") return handleBootstrap(request, env, headers)
      if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env, headers)
      if (request.method === "GET" && path === "/auth/me") return handleMe(request, env, headers)
      const user = await currentUser(request, env)
      if (!user) return json({ error: "Not signed in." }, 401, headers)
      if (path.startsWith("/admin/") && !requireRole(user, "admin")) return json({ error: "Admin access required." }, 403, headers)
      if (path.startsWith("/owner/") && !requireRole(user, "admin", "owner")) return json({ error: "Owner access required." }, 403, headers)
      return json({ error: "Not found." }, 404, headers)
    } catch (error) {
      console.error(error)
      return json({ error: "Unexpected server error." }, 500, headers)
    }
  },
}
