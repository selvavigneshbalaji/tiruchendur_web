export type Hotel = {
  id: string
  name: string
  area: string
  image: string
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
}

export const hotels: Hotel[] = [
  {
    id: "1",
    name: "Sea Breeze Heritage Inn",
    area: "Temple Road, Tiruchendur",
    image: "/images/hotel-1.png",
    rating: 4.9,
    reviews: 412,
    price: 3200,
    oldPrice: 4100,
    tags: ["Free breakfast", "5 min to temple", "Free cancellation"],
    distance: "350 m from Murugan Temple",
    category: "Heritage",
    superhost: true,
    maxGuests: 4,
  },
  {
    id: "2",
    name: "Ocean View Grand Suites",
    area: "Beach Road, Tiruchendur",
    image: "/images/hotel-2.png",
    rating: 4.8,
    reviews: 286,
    price: 4500,
    oldPrice: 5600,
    tags: ["Sea view", "Pool", "Airport pickup"],
    distance: "1.2 km from Murugan Temple",
    category: "Luxury",
    superhost: true,
    maxGuests: 6,
  },
  {
    id: "3",
    name: "Sunset Palms Resort",
    area: "Coastal Drive, Tiruchendur",
    image: "/images/hotel-3.png",
    rating: 4.7,
    reviews: 530,
    price: 5200,
    tags: ["Infinity pool", "Spa", "Beachfront"],
    distance: "2.0 km from Murugan Temple",
    category: "Resort",
    maxGuests: 8,
  },
  {
    id: "4",
    name: "Murugan Heritage Courtyard",
    area: "South Car Street, Tiruchendur",
    image: "/images/hotel-4.png",
    rating: 4.6,
    reviews: 198,
    price: 2400,
    oldPrice: 2900,
    tags: ["Traditional", "Walk to temple", "Pure veg meals"],
    distance: "120 m from Murugan Temple",
    category: "Heritage",
    maxGuests: 4,
  },
  {
    id: "5",
    name: "Bay Terrace Boutique Hotel",
    area: "Harbour View, Tiruchendur",
    image: "/images/hotel-5.png",
    rating: 4.8,
    reviews: 341,
    price: 3900,
    tags: ["Rooftop dining", "Sea view", "Free WiFi"],
    distance: "1.6 km from Murugan Temple",
    category: "Luxury",
    superhost: true,
    maxGuests: 4,
  },
  {
    id: "6",
    name: "Pilgrim Comfort Lodge",
    area: "Bus Stand Road, Tiruchendur",
    image: "/images/hotel-6.png",
    rating: 4.5,
    reviews: 624,
    price: 1500,
    oldPrice: 1900,
    tags: ["Budget friendly", "24h check-in", "Family rooms"],
    distance: "600 m from Murugan Temple",
    category: "Budget",
    maxGuests: 6,
  },
]

// Deterministic pseudo-random booked dates per hotel so availability looks
// realistic and stays stable between renders (no hydration mismatch).
export function getBookedDates(hotelId: string, year: number, month: number): Set<number> {
  const seed = [...hotelId].reduce((a, c) => a + c.charCodeAt(0), 0) + year * 12 + month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const booked = new Set<number>()
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
export function isAvailableForRange(hotelId: string, checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return true
  const start = new Date(checkIn + "T00:00:00")
  const end = new Date(checkOut + "T00:00:00")
  if (!(start < end)) return true

  const cache = new Map<string, Set<number>>()
  const cursor = new Date(start)
  while (cursor < end) {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const key = `${y}-${m}`
    let booked = cache.get(key)
    if (!booked) {
      booked = getBookedDates(hotelId, y, m)
      cache.set(key, booked)
    }
    if (booked.has(cursor.getDate())) return false
    cursor.setDate(cursor.getDate() + 1)
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
