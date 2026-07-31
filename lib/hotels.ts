import * as Sentry from '@sentry/nextjs'

export type Hotel = {
  id: string
  name: string
  area: string
  image: string
  /** Additional image paths or URLs for the property gallery. */
  images?: string[]
  rating: number
  reviews: number
  price: number
  oldPrice?: number
  tags: string[]
  distance: string
  category: string
  superhost?: boolean
  /** Max guests this property can host per booking. */
  maxGuests: number
  includedGuests?: number
  extraGuestPrice?: number
  description: string
  ownerName: string
  ownerContact: string
  googleMapsUrl?: string
  rules: string[]
  availability?: Record<string, { available: boolean; price?: number }>
}

import { normalizeDateValue } from './utils'

const SHEET_CSV_URL = process.env.GOOGLE_SHEETS_CSV_URL || ''
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || ''

export async function debugFetchAppsScriptResponse() {
  if (!APPS_SCRIPT_URL) return { ok: false, reason: 'APPS_SCRIPT_URL is not configured' }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json,text/plain,*/*',
      },
    })

    if (!res.ok) {
      return { ok: false, reason: `HTTP ${res.status}`, status: res.status }
    }

    const text = await res.text()
    return { ok: true, text, parsed: parseHotelsPayload(text) }
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function getSheetExportUrl(value: string): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (trimmed.includes('/pub?output=csv')) return trimmed
  if (trimmed.includes('/pubhtml')) return trimmed.replace('/pubhtml', '/pub?output=csv')
  if (trimmed.includes('/pub?')) return trimmed.includes('output=csv') ? trimmed : `${trimmed}&output=csv`
  if (trimmed.includes('docs.google.com/spreadsheets')) return `${trimmed}${trimmed.includes('?') ? '&' : '?'}output=csv`

  return trimmed
}

export function normalizeSheetCsvUrl(value: string): string {
  if (!value) return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  return getSheetExportUrl(trimmed)
}

function isCsvUrl(value: string) {
  return value.includes('csv') || value.includes('pub?output=csv') || value.includes('pubhtml') === false
}

export const fallbackHotels: Hotel[] = [
  {
    id: '1',
    name: 'Sea Breeze Heritage Inn',
    area: 'Temple Road, Tiruchendur',
    image: '/images/properties/1/hotel-1.png',
    rating: 4.9,
    reviews: 412,
    price: 3200,
    oldPrice: 4100,
    tags: ['Free breakfast', '5 min to temple', 'Free cancellation'],
    distance: '350 m from Murugan Temple',
    category: 'Heritage',
    superhost: true,
    maxGuests: 4,
    description: 'A peaceful heritage stay with traditional architecture, easy temple access, and warm hospitality for pilgrims.',
    ownerName: 'Mrs. Meenakshi Raman',
    ownerContact: '+91 96881 04147',
    rules: ['Check-in from 12:00 PM', 'Check-out by 11:00 AM', 'No loud music after 10:00 PM', 'Respect shared spaces'],
  },
  {
    id: '2',
    name: 'Ocean View Grand Suites',
    area: 'Beach Road, Tiruchendur',
    image: '/images/properties/2/hotel-2.png',
    images: ['/images/properties/2/room-1.jpg'],
    rating: 4.8,
    reviews: 286,
    price: 4500,
    oldPrice: 5600,
    tags: ['Sea view', 'Pool', 'Airport pickup'],
    distance: '1.2 km from Murugan Temple',
    category: 'Luxury',
    superhost: true,
    maxGuests: 6,
    description: 'A premium sea-facing retreat with spacious suites, beach views, and a calm ambience for relaxing stays.',
    ownerName: 'Mr. Aravind Kumar',
    ownerContact: '+91 98765 43210',
    rules: ['Check-in from 2:00 PM', 'Check-out by 12:00 PM', 'Pool access closes at 10:00 PM', 'No smoking inside rooms'],
  },
  {
    id: '3',
    name: 'Sunset Palms Resort',
    area: 'Coastal Drive, Tiruchendur',
    image: '/images/properties/3/hotel-3.jpg',
    rating: 4.7,
    reviews: 530,
    price: 5200,
    tags: ['Infinity pool', 'Spa', 'Beachfront'],
    distance: '2.0 km from Murugan Temple',
    category: 'Resort',
    maxGuests: 8,
    description: 'A resort-style escape with a private beach, spa amenities, and room options for families and groups.',
    ownerName: 'Ms. Priya Selvan',
    ownerContact: '+91 94444 11223',
    rules: ['Check-in from 3:00 PM', 'Check-out by 11:00 AM', 'Guests under 18 need adult supervision', 'Quiet hours from 10:00 PM'],
  },
]

export function parseHotelsPayload(payload: string): Record<string, unknown>[] {
  const trimmed = (payload || '').trim()
  if (!trimmed) return []

  // Try JSON first (Apps Script response)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as any
      if (Array.isArray(parsed)) return parsed as Record<string, unknown>[]

      // Common shapes: { hotels: [...], availability: { hotel1: [...] } }
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.rows)) return parsed.rows as Record<string, unknown>[]
        if (Array.isArray(parsed.data)) return parsed.data as Record<string, unknown>[]
        if (Array.isArray(parsed.hotels)) {
          const hotels = parsed.hotels as Record<string, unknown>[]
          const availability = parsed.availability as Record<string, unknown> | undefined

          return hotels.map((hotel) => {
            const idRaw = hotel.id ?? hotel.Id ?? ''
            const idStr = String(idRaw)
            const normalizedId = idStr.replace(/[^a-z0-9]/gi, '').toLowerCase()
            const fallbackKeys = [
              `hotel${idStr}`,
              `hotels${idStr}`,
              `hotel_${idStr}`,
              `hotels_${idStr}`,
            ]
            const key = normalizedId || idStr
            let sheetAvailability: any | undefined
            if (availability) {
              sheetAvailability = availability[key] || availability[idStr]
              for (const fk of fallbackKeys) {
                if (!sheetAvailability && availability[fk]) sheetAvailability = availability[fk]
              }
            }

            let availabilityText = ''
            let prices: number[] = []
            if (Array.isArray(sheetAvailability)) {
              availabilityText = sheetAvailability
                .map((r) => {
                  const rawDate = r?.dates || r?.date || r?.Date || ''
                  // Normalize the date to handle UTC ISO strings from Apps Script
                  const date = normalizeDateValue(rawDate) || rawDate
                  const state = r?.availability || r?.Availability || 'yes'
                  const price = r?.price ?? r?.Price ?? ''
                  let priceNum = NaN
                  if (typeof price === 'number') priceNum = price
                  else if (typeof price === 'string' && price.trim() !== '') {
                    const m = price.match(/(\d+[\d,]*(?:\.\d+)?)/)
                    if (m) priceNum = Number(m[1].replace(/,/g, ''))
                  }
                  if (Number.isFinite(priceNum)) prices.push(priceNum)
                  return [date, state, price].filter(Boolean).join('|')
                })
                .filter(Boolean)
                .join(',')
            }

            const minPrice = prices.length ? Math.min(...prices) : undefined

            return {
              ...(hotel as Record<string, unknown>),
              ...(minPrice !== undefined ? { price: minPrice } : {}),
              availability: availabilityText,
            }
          })
        }
      }
    } catch (err) {
      // fall through to CSV parsing
    }
  }

  // Fallback: treat payload as CSV text
  // Simple CSV parser: first line headers, subsequent lines values
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return []
  const headers = lines[0].split(/,|\t/).map((h) => h.trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/,|\t/)
    const obj: Record<string, string> = headers.reduce((acc, header, idx) => {
      acc[header] = values[idx] ?? ''
      return acc
    }, {} as Record<string, string>)
    rows.push(obj)
  }
  return rows
}


export function toHotel(row: Record<string, unknown>): Hotel {
  const getValue = (keys: string[]): unknown => {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const value = row[key]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
    }
    return ''
  }

  const priceValue = getValue(['price', 'Price', 'nightPrice', 'night_price', 'roomPrice', 'room_price', 'amount', 'Amount', 'price_per_night', 'pricePerNight'])
  const price = typeof priceValue === 'number'
    ? priceValue
    : (typeof priceValue === 'string' && priceValue.trim() !== '' ? Number(priceValue) : 0)

  const ratingValue = getValue(['rating', 'Rating', 'rate', 'Rate'])
  const rating = typeof ratingValue === 'number'
    ? ratingValue
    : (typeof ratingValue === 'string' && ratingValue.trim() !== '' ? Number(ratingValue) : 4.5)

  const reviewsValue = getValue(['reviews', 'Reviews', 'reviewCount', 'review_count'])
  const reviews = typeof reviewsValue === 'number'
    ? reviewsValue
    : (typeof reviewsValue === 'string' && reviewsValue.trim() !== '' ? Number(reviewsValue) : 100)

  const maxGuestsValue = getValue(['maxGuests', 'max_guests', 'guests', 'Guests'])
  const maxGuests = typeof maxGuestsValue === 'number'
    ? maxGuestsValue
    : (typeof maxGuestsValue === 'string' && maxGuestsValue.trim() !== '' ? Number(maxGuestsValue) : 4)

  const includedGuestsValue = getValue(['includedGuests', 'included_guests', 'baseGuests', 'base_guests'])
  const includedGuests = typeof includedGuestsValue === 'number'
    ? includedGuestsValue
    : (typeof includedGuestsValue === 'string' && includedGuestsValue.trim() !== '' ? Number(includedGuestsValue) : Number(maxGuests))
  const extraGuestPriceValue = getValue(['extraGuestPrice', 'extra_guest_price', 'extraGuestCharge', 'extra_guest_charge'])
  const extraGuestPrice = typeof extraGuestPriceValue === 'number'
    ? extraGuestPriceValue
    : (typeof extraGuestPriceValue === 'string' && extraGuestPriceValue.trim() !== '' ? Number(extraGuestPriceValue) : 0)

  const imageValue = getValue(['image', 'Image', 'img', 'Img', 'imageUrl', 'image_url'])
  const imagesValue = getValue(['images', 'Images', 'gallery', 'Gallery', 'galleryImages', 'gallery_images'])
  
  // Resolve the image path based on hotel ID, with fallback to the per-property folder structure
  const idRaw = getValue(['id', 'Id', 'hotelId', 'hotel_id', 'propertyId', 'property_id'])
  const resolvedId = idRaw !== '' && idRaw !== undefined && idRaw !== null ? String(idRaw) : ''
  
  let image = '/images/properties/1/hotel-1.png'
  
  if (typeof imageValue === 'string' && imageValue) {
    image = imageValue
  } else if (resolvedId) {
    // Assign correct image based on hotel ID from Google Sheets data
    const idNum = parseInt(resolvedId, 10)
    if (idNum >= 1 && idNum <= 6) {
      // Hotel 3 uses .jpg (user updated it), all others use .png
      const ext = idNum === 3 ? 'jpg' : 'png'
      image = `/images/properties/${idNum}/hotel-${idNum}.${ext}`
    }
  }

  // Migrate old flat image paths to new per-property folder structure.
  // Accepts both .png and .jpg extensions automatically.
  const oldImageMatch = image.match(/^\/images\/hotel-(\d+)\.(png|jpg|jpeg)$/i)
  if (oldImageMatch) {
    const hotelId = oldImageMatch[1]
    const ext = oldImageMatch[2].toLowerCase()
    image = `/images/properties/${hotelId}/hotel-${hotelId}.${ext}`
  }
  // Migrate FLH.jpg to property 1 folder
  if (/^\/images\/FLH\.(jpg|jpeg|png)$/i.test(image)) {
    image = '/images/properties/1/FLH.jpg'
  }

  const images = typeof imagesValue === 'string'
    ? imagesValue
      .split(/[,|\n]/)
      .map((value) => value.trim())
      .filter(Boolean)
    : []

  const tagsValue = getValue(['tags', 'Tags', 'tag', 'Tag', 'amenities'])
  const tagsStr = typeof tagsValue === 'string' ? tagsValue : 'Free breakfast,Temple access'

  const availabilityTextValue = getValue(['availability', 'Availability', 'bookedDates', 'blockedDates', 'dates'])
  const availabilityText = typeof availabilityTextValue === 'string' ? availabilityTextValue : ''
  const availability: Record<string, { available: boolean; price?: number }> = {}

  const rawAvailabilityValue = (row as any).availability
  const availabilitySource = typeof rawAvailabilityValue === 'string' && rawAvailabilityValue
    ? rawAvailabilityValue
    : availabilityText

  if (typeof availabilitySource === 'string' && availabilitySource) {
    const parts: string[] = availabilitySource.split(',').map((part: string) => part.trim()).filter(Boolean)
    for (const part of parts) {
      const [rawDate, state, priceText] = (part as string).split('|').map((entry: string) => entry.trim())
      const normalizedDate = normalizeDateValue(rawDate)
      if (!normalizedDate) continue
      const stateStr = String(state || '').toLowerCase()
      const isUnavailable = /no|false|blocked/.test(stateStr)
      let p: number | undefined = undefined
      if (priceText) {
        const m = String(priceText).match(/(\d+[\d,]*(?:\.\d+)?)/)
        if (m) p = Number(m[1].replace(/,/g, ''))
      }
      availability[normalizedDate] = {
        available: !isUnavailable,
        price: p,
      }
    }
  }

  const idValue = getValue(['id', 'Id', 'hotelId', 'hotel_id', 'propertyId', 'property_id'])
  const id = idValue !== '' && idValue !== undefined && idValue !== null ? String(idValue) : `${Math.random()}`

  const nameValue = getValue(['name', 'Name', 'hotelName', 'hotel_name', 'propertyName', 'property_name'])
  let name = nameValue !== '' && nameValue !== undefined && nameValue !== null ? String(nameValue) : 'Unnamed stay'

  const areaValue = getValue(['area', 'Area', 'location', 'Location', 'city'])
  const area = areaValue !== '' && areaValue !== undefined && areaValue !== null ? String(areaValue) : 'Tiruchendur'

  const distanceValue = getValue(['distance', 'Distance', 'location', 'Location', 'distanceFromTemple'])
  const distance = distanceValue !== '' && distanceValue !== undefined && distanceValue !== null ? String(distanceValue) : 'Near the temple'

  const categoryValue = getValue(['category', 'Category', 'type', 'Type', 'propertyType'])
  const category = categoryValue !== '' && categoryValue !== undefined && categoryValue !== null ? String(categoryValue) : 'Heritage'

  const superhostValue = getValue(['superhost', 'Superhost', 'isSuperhost', 'is_superhost'])
  const superhost = superhostValue ? String(superhostValue).toLowerCase() === 'yes' : false

  const descriptionValue = getValue(['description', 'Description', 'details', 'Details'])
  const description = descriptionValue ? String(descriptionValue) : 'Comfortable stay in Tiruchendur.'

  const ownerNameValue = getValue(['ownerName', 'owner_name', 'hostName', 'host_name'])
  const ownerName = ownerNameValue ? String(ownerNameValue) : 'Host'

  const ownerContactValue = getValue(['ownerContact', 'owner_contact', 'hostContact', 'host_contact'])
  const ownerContact = ownerContactValue ? String(ownerContactValue) : 'Contact host'

  const googleMapsValue = getValue([
    'googleMaps',
    'googleMapsUrl',
    'mapUrl',
    'mapsUrl',
    'google_map',
    'google_map_url',
    'maps_link',
    'googleMapsLink',
    'mapsLink',
  ])
  const googleMapsUrl = typeof googleMapsValue === 'string' && googleMapsValue.trim() ? String(googleMapsValue).trim() : ''

  const rule1Value = getValue(['rule1', 'Rule1'])
  const rule2Value = getValue(['rule2', 'Rule2'])
  const rules = [rule1Value ? String(rule1Value) : 'Flexible check-in', rule2Value ? String(rule2Value) : 'Comfortable stay'].filter(Boolean)

  // Map "Feels Like Home" to FLH.jpg (check both .png and .jpg paths)
  if ((image === '/images/properties/1/hotel-1.png' || image === '/images/properties/1/hotel-1.jpg') && name === 'Feels Like Home') {
    image = '/images/properties/1/FLH.jpg'
  }

  return {
    id,
    name,
    area,
    image,
    images,
    rating: Number.isFinite(Number(rating)) ? Number(rating) : 4.5,
    reviews: Number.isFinite(Number(reviews)) ? Number(reviews) : 100,
    price: Number.isFinite(Number(price)) ? Number(price) : 0,
    oldPrice: Number(getValue(['oldPrice', 'old_price', 'oldPriceValue', 'old_price_value']) || 0) || undefined,
    tags: tagsStr.split(',').map((tag) => tag.trim()).filter(Boolean),
    distance,
    category,
    superhost,
    maxGuests: Number.isFinite(Number(maxGuests)) ? Number(maxGuests) : 4,
    includedGuests: Number.isFinite(Number(includedGuests)) && Number(includedGuests) > 0
      ? Math.floor(Number(includedGuests))
      : (Number.isFinite(Number(maxGuests)) ? Math.floor(Number(maxGuests)) : 4),
    extraGuestPrice: Number.isFinite(Number(extraGuestPrice)) && Number(extraGuestPrice) >= 0 ? Number(extraGuestPrice) : 0,
    description,
    ownerName,
    ownerContact,
    googleMapsUrl: typeof googleMapsUrl === 'string' && googleMapsUrl ? googleMapsUrl : undefined,
    rules,
    availability,
  }
}

export function matchesDestination(hotel: Pick<Hotel, 'area' | 'name' | 'description'>, searchText: string): boolean {
  const normalizedSearch = searchText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

  if (!normalizedSearch) return true

  const haystack = [hotel.area, hotel.name, hotel.description]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

  if (!haystack) return false
  if (haystack.includes(normalizedSearch)) return true

  return normalizedSearch
    .split(/\s+/)
    .filter(Boolean)
    .some((token) => haystack.includes(token))
}

export function getGuestAdjustedPrice(hotel: Hotel, basePrice: number, guests = 1): number {
  const guestCount = Number.isFinite(guests) && guests > 0 ? Math.floor(guests) : 1
  const includedGuests = hotel.includedGuests && hotel.includedGuests > 0 ? hotel.includedGuests : hotel.maxGuests
  const extraGuestPrice = hotel.extraGuestPrice && hotel.extraGuestPrice > 0 ? hotel.extraGuestPrice : 0
  return basePrice + Math.max(0, guestCount - includedGuests) * extraGuestPrice
}

export function getPriceForDate(hotel: Hotel, date: string, guests = 1): number {
  if (!date) return getGuestAdjustedPrice(hotel, hotel.price, guests)

  const normalizedDate = normalizeDateValue(date)
  if (!normalizedDate) return getGuestAdjustedPrice(hotel, hotel.price, guests)

  const availability = hotel.availability?.[normalizedDate]
  if (availability) {
    if (availability.available === false) return getGuestAdjustedPrice(hotel, hotel.price, guests)
    if (typeof availability.price === 'number') return getGuestAdjustedPrice(hotel, availability.price, guests)
  }

  return getGuestAdjustedPrice(hotel, hotel.price, guests)
}

export function getDisplayPrice(hotel: Hotel, selectedDate?: string, guests = 1): number {
  if (!selectedDate) {
    const fallbackPrice = getPriceForNextAvailableDate(hotel, new Date(), guests)
    return fallbackPrice
  }

  const resolvedPrice = getPriceForDate(hotel, selectedDate, guests)
  return resolvedPrice
}

export function getPriceForNextAvailableDate(hotel: Hotel, referenceDate = new Date(), guests = 1): number {
  const reference = normalizeDateValue(
    `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}-${String(referenceDate.getDate()).padStart(2, '0')}`,
  )
  if (!reference || !hotel.availability) return getGuestAdjustedPrice(hotel, hotel.price, guests)

  const entries = Object.entries(hotel.availability)
    .filter(([, value]) => value?.available !== false && typeof value?.price === 'number')
    .sort(([a], [b]) => a.localeCompare(b))

  const futureMatch = entries.find(([date]) => date > reference)
  if (futureMatch) return getGuestAdjustedPrice(hotel, futureMatch[1]?.price ?? hotel.price, guests)

  const currentMatch = entries.find(([date]) => date === reference)
  if (currentMatch) return getGuestAdjustedPrice(hotel, currentMatch[1]?.price ?? hotel.price, guests)

  return getGuestAdjustedPrice(hotel, hotel.price, guests)
}

export function getPriceForDateRange(hotel: Hotel, checkIn: string, checkOut: string, guests = 1): number {
  if (!checkIn || !checkOut) return getGuestAdjustedPrice(hotel, hotel.price, guests)

  const normalizedCheckIn = normalizeDateValue(checkIn)
  const normalizedCheckOut = normalizeDateValue(checkOut)
  if (!normalizedCheckIn || !normalizedCheckOut) return getGuestAdjustedPrice(hotel, hotel.price, guests)

  const [startYear, startMonth, startDay] = normalizedCheckIn.split('-').map(Number)
  const [endYear, endMonth, endDay] = normalizedCheckOut.split('-').map(Number)
  const start = new Date(Date.UTC(startYear, startMonth - 1, startDay))
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay))
  if (!(start < end)) return getGuestAdjustedPrice(hotel, hotel.price, guests)

  let total = 0
  const cursor = new Date(start)
  while (cursor < end) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(cursor.getUTCDate()).padStart(2, '0')}`
    total += getPriceForDate(hotel, key, guests)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return total
}

export async function getHotels(): Promise<Hotel[]> {
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        next: { revalidate: 60 },
        headers: {
          Accept: 'application/json,text/plain,*/*',
        },
      })

      if (res.ok) {
        const payload = await res.text()
        const rows = parseHotelsPayload(payload)
        if (rows.length) {
          const hotelsFromResponse = rows.map(toHotel)
          return hotelsFromResponse
        }
      }
      Sentry.captureMessage('Hotel data source returned an unsuccessful response', {
        level: 'warning',
        tags: { provider: 'apps-script', operation: 'get-hotels' },
      })
    } catch (error) {
      Sentry.captureException(error, {
        tags: { provider: 'apps-script', operation: 'get-hotels' },
      })
      // fall through to the sheet export path below
    }
  }

  const normalizedUrl = normalizeSheetCsvUrl(SHEET_CSV_URL)
  if (!normalizedUrl || !isCsvUrl(normalizedUrl)) {
    return fallbackHotels
  }

  try {
    const res = await fetch(normalizedUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    })

    if (!res.ok) {
      return fallbackHotels
    }

    const csv = await res.text()
    const rows = parseHotelsPayload(csv)
    if (!rows.length) {
      return fallbackHotels
    }

    return rows.map(toHotel)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { provider: 'google-sheets', operation: 'get-hotels' },
    })
    return fallbackHotels
  }
}

export const hotels = [] as Hotel[]

// Deterministic pseudo-random booked dates per hotel so availability looks
// realistic and stays stable between renders (no hydration mismatch).
export function getBookedDates(hotelId: string, year: number, month: number, hotel?: Hotel): Set<number> {
  const seed = [...hotelId].reduce((a, c) => a + c.charCodeAt(0), 0) + year * 12 + month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const booked = new Set<number>()

  if (hotel?.availability && Object.keys(hotel.availability).length > 0) {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const availability = hotel.availability[date]
      // A day is considered booked/unavailable if:
      // 1. It is explicitly marked as not available, OR
      // 2. It is NOT present in the availability data at all
      // (only days explicitly present AND marked available are bookable)
      if (!availability || availability.available === false) {
        booked.add(day)
      }
    }
    return booked
  }

  let x = seed % 97
  for (let day = 1; day <= daysInMonth; day++) {
    x = (x * 31 + 17) % 100
    // ~22% of days booked, with weekends slightly more likely
    const weekday = new Date(year, month, day).getDay()
    const threshold = weekday === 0 || weekday === 6 ? 38 : 18
    if (x < threshold) booked.add(day)
  }
  return booked
}

// Returns true if every night between checkIn (inclusive) and checkOut
// (exclusive) is free for the given hotel. Dates are "YYYY-MM-DD" strings.
export function isAvailableForRange(hotelId: string, checkIn: string, checkOut: string, hotel?: Hotel): boolean {
  if (!checkIn || !checkOut) return true

  const normalizedCheckIn = normalizeDateValue(checkIn)
  const normalizedCheckOut = normalizeDateValue(checkOut)
  if (!normalizedCheckIn || !normalizedCheckOut) return true

  const [startYear, startMonth, startDay] = normalizedCheckIn.split('-').map(Number)
  const [endYear, endMonth, endDay] = normalizedCheckOut.split('-').map(Number)
  const start = new Date(Date.UTC(startYear, startMonth - 1, startDay))
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay))
  if (!(start < end)) return true

  const dayKeys: string[] = []
  const cursor = new Date(start)
  while (cursor < end) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}-${String(cursor.getUTCDate()).padStart(2, '0')}`
    dayKeys.push(key)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  if (hotel?.availability && Object.keys(hotel.availability).length > 0) {
    // A day within the range is blocked if:
    // 1. It is explicitly marked as not available, OR
    // 2. It is NOT present in the availability data
    // (only days explicitly present AND marked available are bookable)
    const hasBlockedDay = dayKeys.some((dayKey) => {
      const entry = hotel.availability?.[dayKey]
      return !entry || entry?.available === false
    })

    if (hasBlockedDay) return false

    return true
  }

  const cache = new Map<string, Set<number>>()
  const fallbackCursor = new Date(start)
  while (fallbackCursor < end) {
    const y = fallbackCursor.getUTCFullYear()
    const m = fallbackCursor.getUTCMonth()
    const key = `${y}-${m}`
    let booked = cache.get(key)
    if (!booked) {
      booked = getBookedDates(hotelId, y, m)
      cache.set(key, booked)
    }
    if (booked.has(fallbackCursor.getUTCDate())) return false
    fallbackCursor.setUTCDate(fallbackCursor.getUTCDate() + 1)
  }
  return true
}

export const categories = [
  "All stays",
  "Near Temple",
  "Sea view",
  "Heritage",
  "Luxury",
  "Resort",
  "Budget",
] as const
