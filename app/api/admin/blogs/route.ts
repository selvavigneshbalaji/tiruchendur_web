import { NextRequest, NextResponse } from "next/server"

const workerUrl = (process.env.PORTAL_WORKER_URL || "https://tiruchendur-stays-api.tiruchendur-stays-api.workers.dev").replace(/\/$/, "")

function copyHeaders(response: Response) {
  const headers = new Headers()
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "content-length") headers.set(key, value)
  })
  headers.set("cache-control", "no-store")
  return headers
}

async function proxyBlogRequest(request: NextRequest) {
  const url = new URL(`${workerUrl}/admin/blogs`)
  url.search = request.nextUrl.search

  const headers = new Headers()
  const cookie = request.headers.get("cookie")
  const contentType = request.headers.get("content-type")
  if (cookie) headers.set("cookie", cookie)
  if (contentType) headers.set("content-type", contentType)

  const upstream = await fetch(url, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
  })

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: copyHeaders(upstream),
  })
}

export async function GET(request: NextRequest) {
  return proxyBlogRequest(request)
}

export async function POST(request: NextRequest) {
  return proxyBlogRequest(request)
}

export async function PATCH(request: NextRequest) {
  return proxyBlogRequest(request)
}

export async function DELETE(request: NextRequest) {
  return proxyBlogRequest(request)
}
