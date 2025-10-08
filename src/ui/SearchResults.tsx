import React, { useMemo, useState } from 'react'
import { Itinerary, ticketClassToDisplay } from '../utils/types'

export const SearchResults: React.FC<{
  itineraries: Itinerary[]
  onAddItinerary: (i: Itinerary) => void
}> = ({ itineraries, onAddItinerary }) => {
  const [sortOrder, setSortOrder] = useState<'price'|'duration'>('price')

  const sorted = useMemo(() => {
    const items = [...(itineraries || [])]
    if (sortOrder === 'price') items.sort((a,b)=>a.price-b.price)
    else items.sort((a,b)=>a.totalDurationHours-b.totalDurationHours)
    return items
  }, [itineraries, sortOrder])

  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <img src="/plane.png" alt="No flights" className="empty-state-plane" />
        </div>
        <h3>No flights found</h3>
        <p>Try adjusting your search criteria to find more options.</p>
      </div>
    )
  }

  return (
    <>
      <div className="results-header">
        <h2 className="results-title">{itineraries.length} flight{itineraries.length !== 1 ? 's' : ''} found</h2>
        <select className="results-sort" value={sortOrder}
          onChange={e=> setSortOrder(e.target.value as any)}>
          <option value="price">Sort by Price</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>

      {sorted.map((item, idx) => (
        <div key={`${idx}-${item.price}-${item.outbound.fromAirportCode}-${item.return.toAirportCode}`} className="flight-card">
          <div className="flight-segments">
            <div className="flight-segment">
              <SearchResultFlightSegment flight={item.outbound} />
            </div>
            <div className="flight-segment">
              <SearchResultFlightSegment flight={item.return} />
            </div>
          </div>
          <div className="flight-price-section">
            <div className="flight-price">
              {item.price.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            </div>
            <button className="add-btn" onClick={() => onAddItinerary(item)}>
              Add to Trip
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

const SearchResultFlightSegment: React.FC<{ flight: Itinerary['outbound'] }> = ({ flight }) => (
  <>
    <div className="flight-icon">
      <img src="/plane.png" alt="Flight" className="flight-plane-icon" />
    </div>
    <div className="airline-info">
      <div className="airline-name">{flight.airline}</div>
      <div className="ticket-class">{ticketClassToDisplay(flight.ticketClass)}</div>
    </div>
    <div className="flight-time">
      <div className="time">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
      <div className="date">{new Date(flight.departureTime).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric'})} ({flight.fromAirportCode})</div>
    </div>
    <div className="flight-arrow">→</div>
    <div className="flight-time">
      <div className="time">{new Date(flight.returnTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
      <div className="date">{new Date(flight.returnTime).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric'})} ({flight.toAirportCode})</div>
    </div>
    <div className="flight-duration">{flight.durationHours}h</div>
  </>
)
