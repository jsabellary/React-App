import React from 'react'
import { Itinerary, ticketClassToDisplay } from '../utils/types'

export const Shortlist: React.FC<{
  itineraries: Itinerary[]
  onRemoveItinerary: (i: Itinerary) => void
}> = ({ itineraries, onRemoveItinerary }) => (
  <>
    <div className="shortlist-header">
      My Trip <span className="shortlist-count">{itineraries.length}</span>
    </div>
    {itineraries.length === 0 ? (
      <div className="empty-state">
        <div className="empty-state-icon">🎒</div>
        <h4 style={{color: 'white', marginTop: '1rem'}}>No flights selected</h4>
        <p style={{color: 'var(--gray-300)', fontSize: '0.875rem'}}>Add flights to your trip to see them here</p>
      </div>
    ) : (
      itineraries.map((item, idx) => (
        <div className="shortlist-item" key={`${idx}-${item.price}-${item.outbound.fromAirportCode}-${item.return.toAirportCode}`}>
          <div className="shortlist-header-section">
            <div className="shortlist-route">
              {item.outbound.fromAirportCode} → {item.outbound.toAirportCode}
            </div>
            <button className="remove-btn" aria-label="Remove flight" onClick={() => onRemoveItinerary(item)}>
              ×
            </button>
          </div>
          <div className="shortlist-flight">
            <ShortlistFlightSegment flight={item.outbound} />
          </div>
          <div className="shortlist-flight">
            <ShortlistFlightSegment flight={item.return} />
          </div>
          <div className="shortlist-total">
            <div className="shortlist-airline">{item.airlineName}</div>
            <div className="shortlist-price">
              {item.price.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      ))
    )}
  </>
)

const ShortlistFlightSegment: React.FC<{ flight: Itinerary['outbound'] }> = ({ flight }) => (
  <>
    <div className="shortlist-time">
      <div className="time">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
      <div className="shortlist-date">{flight.fromAirportCode}</div>
    </div>
    <div className="shortlist-arrow">→</div>
    <div className="shortlist-time">
      <div className="time">{new Date(flight.returnTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
      <div className="shortlist-date">{flight.toAirportCode}</div>
    </div>
  </>
)
