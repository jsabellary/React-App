import React from 'react'
import { AppStateProvider, useAppState } from '../utils/state'
import { Search } from './Search'
import { SearchResults } from './SearchResults'
import { Shortlist } from './Shortlist'
import { GreyOutZone } from './GreyOutZone'
import '../styles/site.css'

const Layout: React.FC = () => {
  const state = useAppState()

  return (
    <div className="app-container">
      <div id="search-and-results-area">
        <div id="search-area">
          <div className="search-container">
            <h1 className="search-title">
              <img src="/plane.png" alt="Airplane" className="title-icon" />
              FlightFinder
            </h1>
            <Search onSearch={state.search} />
          </div>
        </div>
        <div id="results-area">
          <GreyOutZone isGreyedOut={state.searchInProgress}>
            <SearchResults
              itineraries={state.searchResults || []}
              onAddItinerary={state.addToShortlist}
            />
          </GreyOutZone>
        </div>
      </div>
      <div id="selections-area">
        <Shortlist
          itineraries={state.shortlist}
          onRemoveItinerary={state.removeFromShortlist}
        />
      </div>
    </div>
  )
}

export const App: React.FC = () => (
  <AppStateProvider>
    <Layout />
  </AppStateProvider>
)
