import { BOARD_INDICES, COLUMN_LABELS, coordKey, coordLabel, isSunk, shotAt } from '../game/board'
import { type Coord, type Fleet, type ShipId } from '../game/types'
import { ShipSprite } from './ShipSprite'

interface BoardProps {
  fleet: Fleet
  /** Show this fleet's own ships (own board, or the loser's board at game over). */
  revealShips: boolean
  label: string
  onCellClick?: (cell: Coord) => void
  onCellHover?: (cell: Coord | null) => void
  preview?: Coord[]
  previewValid?: boolean
  previewShip?: ShipId
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
  previewShip,
  disabled = false,
}: BoardProps) {
  const previewKeys = new Set(preview.map(coordKey))

  return (
    <div className="board">
      <div className="board-label">{label}</div>
      <div className="grid" onMouseLeave={() => onCellHover?.(null)}>
        <div className="col-labels">
          <span className="corner" />
          {COLUMN_LABELS.map((letter) => (
            <span key={letter}>{letter}</span>
          ))}
        </div>
        <div className="grid-main">
          <div className="row-labels">
            {BOARD_INDICES.map((row) => (
              <span key={row}>{row + 1}</span>
            ))}
          </div>
          <div className="play-area">
            {BOARD_INDICES.map((row) => (
              <div key={row} className="grid-row">
                {BOARD_INDICES.map((col) => {
                  const cell = { row, col }
                  const key = coordKey(cell)
                  const shot = shotAt(fleet, cell)
                  const classes = ['cell']
                  if (shot?.result === 'miss') classes.push('miss')
                  if (shot && shot.result !== 'miss') classes.push('hit')
                  if (previewKeys.has(key)) classes.push(previewValid ? 'preview' : 'preview-bad')
                  const outcome = shot ? (shot.result === 'miss' ? ' — miss' : ' — hit') : ''

                  return (
                    <button
                      key={key}
                      type="button"
                      className={classes.join(' ')}
                      disabled={disabled || shot !== undefined}
                      aria-label={`${label} ${coordLabel(cell)}${outcome}`}
                      onClick={() => onCellClick?.(cell)}
                      onMouseEnter={() => onCellHover?.(cell)}
                      onFocus={() => onCellHover?.(cell)}
                    />
                  )
                })}
              </div>
            ))}
            <div className="ships-layer">
              {revealShips
                ? fleet.ships.map((ship) => (
                    <ShipSprite key={ship.id} id={ship.id} cells={ship.cells} sunk={isSunk(ship)} />
                  ))
                : null}
              {previewShip && preview.length > 0 ? (
                <ShipSprite
                  id={previewShip}
                  cells={preview}
                  ghost={previewValid ? 'valid' : 'invalid'}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
