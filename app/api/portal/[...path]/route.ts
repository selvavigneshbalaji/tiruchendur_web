import { NextRequest } from "next/server"

const workerUrl = (process.env.PORTAL_WORKER_URL || "https://tiruchendur-stays-api.tiruchendur-stays-api.workers.dev").replace(/\/$/, "")
const sessionCookie = "ts_session"

function copyResponseHeaders(upstream: Response) {
  const headers = new Headers()
  const contentType = upstream.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  headers.set("cache-control", "no-store")
  return headers
}

function extractCookie(cookie: string | null) {
  return cookie?.match(/(?:^|,)\s*ts_session=([^;]+)/)?.[1] || null
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context)
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const url = new URL(`${workerUrl}/${path.map(encodeURIComponent).join("/")}`)
  url.search = request.nextUrl.search
  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  const cookie = request.headers.get("cookie")
  const bootstrapToken = request.headers.get("x-bootstrap-token")
  if (contentType) headers.set("content-type", contentType)
  if (cookie) headers.set("cookie", cookie)
  // Used only by the one-time /admin/setup page. The token is never stored
  // in the application and is sent only to the Cloudflare Worker.
  if (path.join("/") === "setup" && bootstrapToken) headers.set("x-bootstrap-token", bootstrapToken)

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      // The body is a stream from the incoming request.
      duplex: "half",
    } as RequestInit)
  } catch (error) {
    console.error("Portal worker request failed", error)
    return Response.json({ error: "The admin service is unavailable. Check PORTAL_WORKER_URL and the worker deployment." }, { status: 502, headers: { "cache-control": "no-store" } })
  }
  const responseHeaders = copyResponseHeaders(upstream)
  const upstreamSession = extractCookie(upstream.headers.get("set-cookie"))

  if (path.join("/") === "auth/login" && upstreamSession) {
    responseHeaders.append("Set-Cookie", `${sessionCookie}=${upstreamSession}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`)
  }
  if (path.join("/") === "auth/logout") {
    responseHeaders.append("Set-Cookie", `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}
