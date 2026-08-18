import { useState } from 'react'
import { Board } from './Board'
import { canPlace, placeShip, randomFleet, shipCells } from '../game/board'
import { SHIP_KINDS, type Coord, type Fleet, type Orientation, type Ship } from '../game/types'

interface PlacementProps {
  playerName: string
  onDone: (fleet: Fleet) => void
}

export function Placement({ playerName, onDone }: PlacementProps) {
  const [ships, setShips] = useState<Ship[]>([])
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [hover, setHover] = useState<Coord | null>(null)

  const nextKind = SHIP_KINDS[ships.length]
  const done = nextKind === undefined
  const fleet: Fleet = { ships, incoming: [] }
  const preview = nextKind && hover ? shipCells(nextKind, hover, orientation) : []
  const previewValid = preview.length > 0 && canPlace(ships, preview)

  function handleClick(cell: Coord) {
    if (!nextKind) return
    const placed = placeShip(ships, nextKind, cell, orientation)
    if (placed) setShips(placed)
  }

  return (
    <section className="screen placement">
      <h2 className="placement-heading">{playerName}, place your fleet</h2>
      <div className="placement-body">
        <Board
          fleet={fleet}
          revealShips
          label="Your waters"
          onCellClick={handleClick}
          onCellHover={setHover}
          preview={preview}
          previewValid={previewValid}
          disabled={done}
        />
        <aside className="panel">
          <p className="hint">
            {done
              ? 'All ships are at sea. Ready to play!'
              : `Tap a square to drop your ${nextKind.name} (${nextKind.size} squares).`}
          </p>
          <ol className="ship-list">
            {SHIP_KINDS.map((kind, index) => (
              <li
                key={kind.id}
                className={index < ships.length ? 'placed' : index === ships.length ? 'current' : ''}
              >
                <span>{kind.emoji}</span> {kind.name} <small>({kind.size})</small>
              </li>
            ))}
          </ol>
          <div className="controls">
            <button
              type="button"
              onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
              disabled={done}
            >
              Rotate: {orientation === 'horizontal' ? 'across ↔' : 'down ↕'}
            </button>
            <button type="button" onClick={() => setShips(randomFleet().ships)}>
              Place for me 🎲
            </button>
            <button type="button" onClick={() => setShips([])} disabled={ships.length === 0}>
              Clear
            </button>
            <button type="button" className="primary" disabled={!done} onClick={() => onDone(fleet)}>
              Set sail ⚓
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
