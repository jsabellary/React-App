import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Airport, Itinerary, SearchCriteria } from './types'

// Read API base from Vite env (set VITE_API_BASE for production builds)
const ENV_BASE = (import.meta as any)?.env?.VITE_API_BASE as string | undefined
const NORMALIZED_BASE = (ENV_BASE ?? '').replace(/\/+$/, '')

class ApiClient {
  private base: string
  constructor(baseUrl: string = NORMALIZED_BASE) {
    this.base = baseUrl
  }

  async search(criteria: SearchCriteria): Promise<Itinerary[]> {
    const res = await fetch(`${this.base}/api/flightsearch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        FromAirport: criteria.fromAirport,
        ToAirport: criteria.toAirport,
        OutboundDate: criteria.outboundDate,
        ReturnDate: criteria.returnDate,
        TicketClass: criteria.ticketClass
      })
    })
    if (!res.ok) throw new Error('Search failed')
    return res.json()
  }

  async airports(): Promise<Airport[]> {
    const res = await fetch(`${this.base}/api/airports`)
    if (!res.ok) throw new Error('Airports failed')
    const data = await res.json()
    return data
  }
}

const StateContext = createContext<ReturnType<typeof createState> | null>(null)

function createState() {
  const api = new ApiClient()
  const [searchResults, setSearchResults] = useState<Itinerary[] | null>(null)
  const [searchInProgress, setSearchInProgress] = useState(false)
  const [shortlist, setShortlist] = useState<Itinerary[]>([])
  const [airports, setAirports] = useState<Airport[]>([])

  useEffect(() => {
    api.airports().then(setAirports).catch(() => setAirports([]))
  }, [])

  const search = async (criteria: SearchCriteria) => {
    setSearchInProgress(true)
    try {
      const results = await api.search(criteria)
      setSearchResults(results)
    } finally {
      setSearchInProgress(false)
    }
  }

  const addToShortlist = (it: Itinerary) => setShortlist(s => [...s, it])
  const removeFromShortlist = (it: Itinerary) => setShortlist(s => s.filter(x => x !== it))

  return {
    searchResults,
    searchInProgress,
    shortlist,
    airports,
    search,
    addToShortlist,
    removeFromShortlist
  }
}

export const AppStateProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const value = createState()
  return <StateContext.Provider value={value}>{children}</StateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(StateContext)
  if (!ctx) throw new Error('Missing AppStateProvider')
  return ctx
}
