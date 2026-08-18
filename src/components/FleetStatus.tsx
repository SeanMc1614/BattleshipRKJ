import { isSunk } from '../game/board'
import { type Fleet } from '../game/types'
import { ShipRow } from './ShipRow'

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
            <ShipRow
              key={ship.id}
              id={ship.id}
              size={ship.cells.length}
              name={ship.name}
              tally={sunk ? 'sunk' : `${ship.hits}/${ship.cells.length}`}
              sunk={sunk}
              className={sunk ? 'sunk-ship' : ''}
            />
          )
        })}
      </ul>
    </div>
  )
}
