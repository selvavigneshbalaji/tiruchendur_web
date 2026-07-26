import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Lightweight liveness endpoint for uptime monitors. It intentionally avoids
 * calling third-party services so an upstream outage does not make this app
 * appear unavailable.
 */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0' },
    },
  )
}
