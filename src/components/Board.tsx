import { COLUMN_LABELS, coordKey, coordLabel, isSunk, shipAt, shotAt } from '../game/board'
import { BOARD_SIZE, type Coord, type Fleet } from '../game/types'

interface BoardProps {
  fleet: Fleet
  /** Show this fleet's own ships (own board, or the loser's board at game over). */
  revealShips: boolean
  label: string
  onCellClick?: (cell: Coord) => void
  onCellHover?: (cell: Coord | null) => void
  preview?: Coord[]
  previewValid?: boolean
  disabled?: boolean
}

export function Board({
  fleet,
  revealShips,
  label,
  onCellClick,
  onCellHover,
  preview = [],
  previewValid = true,
  disabled = false,
}: BoardProps) {
  const previewKeys = new Set(preview.map(coordKey))
  const sunkKeys = new Set(fleet.ships.filter(isSunk).flatMap((ship) => ship.cells.map(coordKey)))

  return (
    <div className="board">
      <div className="board-label">{label}</div>
      <div className="grid" onMouseLeave={() => onCellHover?.(null)}>
        <div className="grid-row">
          <div className="cell header" />
          {COLUMN_LABELS.map((letter) => (
            <div key={letter} className="cell header">
              {letter}
            </div>
          ))}
        </div>
        {Array.from({ length: BOARD_SIZE }, (_, row) => (
          <div key={row} className="grid-row">
            <div className="cell header">{row + 1}</div>
            {Array.from({ length: BOARD_SIZE }, (_, col) => {
              const cell = { row, col }
              const key = coordKey(cell)
              const shot = shotAt(fleet, cell)
              const hasShip = revealShips && shipAt(fleet.ships, cell) !== undefined
              const sunk = sunkKeys.has(key)
              const classes = ['cell', 'water']
              if (hasShip) classes.push('ship')
              if (shot?.result === 'miss') classes.push('miss')
              if (shot && shot.result !== 'miss') classes.push(sunk ? 'sunk' : 'hit')
              if (previewKeys.has(key)) classes.push(previewValid ? 'preview' : 'preview-bad')

              return (
                <button
                  key={key}
                  type="button"
                  className={classes.join(' ')}
                  disabled={disabled || shot !== undefined}
                  aria-label={`${label} ${coordLabel(cell)}`}
                  onClick={() => onCellClick?.(cell)}
                  onMouseEnter={() => onCellHover?.(cell)}
                  onFocus={() => onCellHover?.(cell)}
                >
                  {shot?.result === 'miss' ? '•' : null}
                  {shot && shot.result !== 'miss' ? '✖' : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
