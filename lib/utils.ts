import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDateValue(value: string | null) {
  if (!value) return null

  const [datePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const safeDate = new Date(Date.UTC(year, month - 1, day))
  return Number.isNaN(safeDate.getTime()) ? null : safeDate
}

// IST offset in milliseconds (5 hours 30 minutes = 19800000 ms)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export function normalizeDateValue(value: string | null) {
  if (!value) return null

  // If the value is a full ISO datetime (e.g. "2026-07-21T18:30:00.000Z"),
  // parse it and convert to IST explicitly. This ensures consistency
  // between server (UTC) and client (IST) environments.
  if (value.includes('T') || value.includes('Z') || value.includes('+')) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    // Add IST offset (5h30m) so midnight IST → IST date
    const istDate = new Date(parsed.getTime() + IST_OFFSET_MS)
    const yyyy = istDate.getUTCFullYear()
    const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(istDate.getUTCDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  // Plain date string "YYYY-MM-DD" — use UTC to avoid timezone shifts
  const [year, month, day] = value.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }

  const safeDate = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(safeDate.getTime())) return null

  const yyyy = safeDate.getUTCFullYear()
  const mm = String(safeDate.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(safeDate.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatDateForDisplay(value: string | null, includeYear = true) {
  const parsed = parseDateValue(value)
  if (!parsed) return 'Select dates'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(parsed)
}
