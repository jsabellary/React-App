export enum TicketClass {
  Economy = 0,
  PremiumEconomy = 1,
  Business = 2,
  First = 3
}

export type SearchCriteria = {
  fromAirport: string
  toAirport: string
  outboundDate: string
  returnDate: string
  ticketClass: TicketClass
}

export type FlightSegment = {
  airline: string
  fromAirportCode: string
  toAirportCode: string
  departureTime: string
  returnTime: string
  durationHours: number
  ticketClass: TicketClass
}

export type Itinerary = {
  outbound: FlightSegment
  return: FlightSegment
  price: number
  totalDurationHours: number
  airlineName: string
}

export type Airport = {
  code: string
  displayName: string
}

export const ticketClassToDisplay = (t: TicketClass) => {
  switch (t) {
    case TicketClass.Economy: return 'Economy'
    case TicketClass.PremiumEconomy: return 'Premium Economy'
    case TicketClass.Business: return 'Business'
    case TicketClass.First: return 'First'
    default: return ''
  }
}
