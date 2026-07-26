
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getDisplayPrice, getPriceForDate, getPriceForDateRange, getPriceForNextAvailableDate, isAvailableForRange, matchesDestination, normalizeSheetCsvUrl, parseHotelsPayload, toHotel, type Hotel } from '../lib/hotels'

describe('isAvailableForRange', () => {
  it('parses datetime values from the homepage search flow', () => {
    assert.equal(isAvailableForRange('1', '2026-07-03T15:00', '2026-07-04T15:00'), false)
    assert.equal(isAvailableForRange('1', '2026-07-20T15:00', '2026-07-21T15:00'), true)
  })

  it('uses hotel availability entries when present', () => {
    const hotel = {
      id: '2',
      name: 'Aravind Home Stay',
      area: 'Tiruchendur',
      image: '/images/properties/1/hotel-1.png',
      rating: 4.8,
      reviews: 100,
      price: 1500,
      tags: [],
      distance: 'Near the temple',
      category: 'Heritage',
      maxGuests: 4,
      description: 'A test hotel',
      ownerName: 'Host',
      ownerContact: 'Contact',
      rules: [],
      availability: {
        '2026-07-28': { available: true, price: 2000 },
        '2026-07-29': { available: true, price: 2000 },
      },
    } as Hotel

    assert.equal(isAvailableForRange('2', '2026-07-28T15:00', '2026-07-30T11:00', hotel), true)
  })

  it('rejects a range when the selected date is blocked', () => {
    const hotel = {
      id: '2',
      name: 'Aravind Home Stay',
      area: 'Tiruchendur',
      image: '/images/properties/1/hotel-1.png',
      rating: 4.8,
      reviews: 100,
      price: 1500,
      tags: [],
      distance: 'Near the temple',
      category: 'Heritage',
      maxGuests: 4,
      description: 'A test hotel',
      ownerName: 'Host',
      ownerContact: 'Contact',
      rules: [],
      availability: {
        '2026-07-23': { available: false, price: 2000 },
        '2026-07-24': { available: true, price: 2200 },
      },
    } as Hotel

    assert.equal(isAvailableForRange('2', '2026-07-23T15:00', '2026-07-24T11:00', hotel), false)
  })
})

describe('normalizeSheetCsvUrl', () => {
  it('converts published Google Sheets links to CSV endpoints', () => {
    assert.equal(
      normalizeSheetCsvUrl('https://docs.google.com/spreadsheets/d/e/abc/pubhtml'),
      'https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv'
    )
    assert.equal(
      normalizeSheetCsvUrl('https://docs.google.com/spreadsheets/d/e/abc/pub?gid=123'),
      'https://docs.google.com/spreadsheets/d/e/abc/pub?gid=123&output=csv'
    )
  })
})

describe('parseHotelsPayload', () => {
  it('maps Apps Script availability rows keyed by hotel sheet names', () => {
    const payload = JSON.stringify({
      hotels: [{ id: 1, name: 'Test Hotel', area: 'Tiruchendur', price: 3000 }],
      availability: {
        hotel1: [{ dates: '2026-07-21', availability: 'yes', price: 3000 }],
      },
    })

    const parsed = parseHotelsPayload(payload)
    const hotel = toHotel(parsed[0])

    assert.equal(hotel.name, 'Test Hotel')
    assert.equal(hotel.availability?.['2026-07-21']?.available, true)
    assert.equal(hotel.availability?.['2026-07-21']?.price, 3000)
  })
})

describe('getPriceForDate', () => {
  it('uses the availability price for a specific date when present', () => {
    const hotel = {
      id: '1',
      name: 'Test Hotel',
      area: 'Tiruchendur',
      image: '/images/properties/1/hotel-1.png',
      rating: 4.5,
      reviews: 100,
      price: 3000,
      tags: [],
      distance: 'Near the temple',
      category: 'Heritage',
      maxGuests: 4,
      description: 'A test hotel',
      ownerName: 'Host',
      ownerContact: 'Contact',
      rules: [],
      availability: {
        '2026-07-22': { available: true, price: 3000 },
        '2026-07-23': { available: true, price: 3500 },
      },
    } as Hotel

    assert.equal(getPriceForDate(hotel, '2026-07-23'), 3500)
    assert.equal(getPriceForDate(hotel, '2026-07-24'), 3000)
    assert.equal(getPriceForDateRange(hotel, '2026-07-22', '2026-07-24'), 6500)
    assert.equal(getPriceForNextAvailableDate(hotel, new Date('2026-07-22T00:00:00.000Z')), 3500)
    assert.equal(getDisplayPrice(hotel, '2026-07-24'), 3000)
  })

  it('falls back to the base price when a date is marked unavailable', () => {
    const hotel = {
      id: '2',
      name: 'Aravind Home Stay',
      area: 'Tiruchendur',
      image: '/images/properties/1/hotel-1.png',
      rating: 4.8,
      reviews: 100,
      price: 1500,
      tags: [],
      distance: 'Near the temple',
      category: 'Heritage',
      maxGuests: 4,
      description: 'A test hotel',
      ownerName: 'Host',
      ownerContact: 'Contact',
      rules: [],
      availability: {
        '2026-07-22': { available: true, price: 2000 },
        '2026-07-23': { available: false, price: 2000 },
        '2026-07-24': { available: true, price: 2200 },
      },
    } as Hotel

    assert.equal(getPriceForDate(hotel, '2026-07-23'), 1500)
    assert.equal(getPriceForNextAvailableDate(hotel, new Date('2026-07-23T00:00:00.000Z')), 2200)
  })
})

describe('matchesDestination', () => {
  it('matches full destination phrases with punctuation', () => {
    const hotel = {
      area: 'Tiruchendur',
      name: 'Sea Breeze Heritage Inn',
      description: 'Peaceful stay near the temple',
    } as Hotel

    assert.equal(matchesDestination(hotel, 'Tiruchendur, Tamil Nadu'), true)
    assert.equal(matchesDestination(hotel, 'Temple stay'), true)
    assert.equal(matchesDestination(hotel, 'Madurai'), false)
  })
})
