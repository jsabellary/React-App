import React, { useMemo, useState } from 'react'
import { useAppState } from '../utils/state'
import { SearchCriteria, TicketClass } from '../utils/types'

const todayISO = () => new Date().toISOString().slice(0,10)
const plusDaysISO = (days: number) => new Date(Date.now() + days*24*60*60*1000).toISOString().slice(0,10)

export const Search: React.FC<{ onSearch: (criteria: SearchCriteria) => void }> = ({ onSearch }) => {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    fromAirport: 'LHR',
    toAirport: 'SEA',
    outboundDate: todayISO(),
    returnDate: plusDaysISO(7),
    ticketClass: TicketClass.Economy
  })
  const { airports } = useAppState()

  const airportDatalist = useMemo(() => (
    <datalist id="airports">
      {airports.map(a => (
        <option key={a.code} value={a.code}>{`${a.displayName} (${a.code})`}</option>
      ))}
    </datalist>
  ), [airports])

  return (
    <div className="search-form">
      <div className="search-row">
        <div className="search-field">
          <label htmlFor="from-airport">Departure</label>
          <input
            id="from-airport"
            list="airports"
            placeholder="From where?"
            value={criteria.fromAirport}
            onChange={e => setCriteria({ ...criteria, fromAirport: e.target.value })}
          />
        </div>
        <div className="arrow-connector">→</div>
        <div className="search-field">
          <label htmlFor="to-airport">Destination</label>
          <input
            id="to-airport"
            list="airports"
            placeholder="To where?"
            value={criteria.toAirport}
            onChange={e => setCriteria({ ...criteria, toAirport: e.target.value })}
          />
        </div>
      </div>

      <div className="search-row">
        <div className="search-field">
          <label htmlFor="depart-date">Departure Date</label>
          <input
            id="depart-date"
            type="date"
            value={criteria.outboundDate}
            onChange={e => setCriteria({ ...criteria, outboundDate: e.target.value })}
          />
        </div>
        <div className="arrow-connector">→</div>
        <div className="search-field">
          <label htmlFor="return-date">Return Date</label>
          <input
            id="return-date"
            type="date"
            value={criteria.returnDate}
            onChange={e => setCriteria({ ...criteria, returnDate: e.target.value })}
          />
        </div>
      </div>

      <div className="search-actions">
        <div className="search-field class-select">
          <label htmlFor="ticket-class">Travel Class</label>
          <select
            id="ticket-class"
            value={criteria.ticketClass}
            onChange={e => setCriteria({ ...criteria, ticketClass: parseInt(e.target.value) as TicketClass })}
          >
            <option value={TicketClass.Economy}>Economy</option>
            <option value={TicketClass.PremiumEconomy}>Premium Economy</option>
            <option value={TicketClass.Business}>Business</option>
            <option value={TicketClass.First}>First Class</option>
          </select>
        </div>
        <button onClick={() => onSearch(criteria)} type="button" className="search-btn">
          <img src="/search.png" alt="Search" className="search-icon" />
          Search Flights
        </button>
      </div>
      {airportDatalist}
    </div>
  )
}