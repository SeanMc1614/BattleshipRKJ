import { isSunk } from '../game/board'
import { type Fleet } from '../game/types'
import { ShipGlyph } from './ShipSprite'

interface FleetStatusProps {
  title: string
  fleet: Fleet
}

export function FleetStatus({ title, fleet }: FleetStatusProps) {
  return (
    <div className="fleet-status panel">
      <h3>{title}</h3>
      <ul>
        {fleet.ships.map((ship) => {
          const sunk = isSunk(ship)
          return (
            <li key={ship.id} className={sunk ? 'sunk-ship' : ''}>
              <ShipGlyph id={ship.id} size={ship.cells.length} sunk={sunk} />
              <span className="ship-name">{ship.name}</span>
              <span className="ship-tally">{sunk ? 'sunk' : `${ship.hits}/${ship.cells.length}`}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
