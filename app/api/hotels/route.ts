import { NextResponse } from 'next/server'
import { fallbackHotels, getHotels } from '@/lib/hotels'

export async function GET() {
  try {
    const hotels = await getHotels()
    return NextResponse.json(hotels.length ? hotels : fallbackHotels)
  } catch {
    return NextResponse.json(fallbackHotels)
  }
}
