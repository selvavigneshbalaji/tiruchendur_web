"use client"

import { createContext, useContext, useState } from "react"

export type SearchCriteria = {
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
  /** Set true once the user runs a search, so the list switches to results mode. */
  searched: boolean
}

const initialCriteria: SearchCriteria = {
  checkIn: "",
  checkOut: "",
  guests: 2,
  rooms: 1,
  searched: false,
}

type SearchContextValue = {
  criteria: SearchCriteria
  setCriteria: (next: SearchCriteria) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria)
  return (
    <SearchContext.Provider value={{ criteria, setCriteria }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider")
  return ctx
}
