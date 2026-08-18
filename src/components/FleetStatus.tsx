import { isSunk } from '../game/board'
import { SHIP_KINDS, type Fleet } from '../game/types'

interface FleetStatusProps {
  title: string
  fleet: Fleet
}

export function FleetStatus({ title, fleet }: FleetStatusProps) {
  return (
    <div className="fleet-status">
      <h3>{title}</h3>
      <ul>
        {fleet.ships.map((ship) => {
          const kind = SHIP_KINDS.find((k) => k.id === ship.id)
          return (
            <li key={ship.id} className={isSunk(ship) ? 'sunk-ship' : ''}>
              <span>{kind?.emoji}</span> {ship.name}
              {isSunk(ship) ? ' — sunk!' : ` ${ship.hits}/${ship.cells.length}`}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
