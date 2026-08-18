import type { Coord, ShipId } from '../game/types'

const CELL_UNITS = 100

/** Grey top-down hull, bow to the right, in a `length` x 100 viewBox. */
function hullPath(length: number) {
  return `M ${length - 6} 50
    C ${length - 14} 32 ${length - 46} 18 ${length - 110} 16
    L 52 16 C 26 18 12 30 12 50 C 12 70 26 82 52 84
    L ${length - 110} 84 C ${length - 46} 82 ${length - 14} 68 ${length - 6} 50 Z`
}

function subPath(length: number) {
  return `M 12 50
    C 12 30 34 20 64 20 L ${length - 60} 20
    C ${length - 26} 20 ${length - 12} 32 ${length - 12} 50
    C ${length - 12} 68 ${length - 26} 80 ${length - 60} 80 L 64 80
    C 34 80 12 70 12 50 Z`
}

function Turret({ x }: { x: number }) {
  return (
    <g className="ship-detail">
      <rect x={x} y={45} width={32} height={10} rx={4} />
      <circle cx={x} cy={50} r={14} />
    </g>
  )
}

function Funnel({ x }: { x: number }) {
  return <rect className="ship-detail" x={x} y={34} width={20} height={32} rx={6} />
}

function shipArt(id: ShipId, length: number) {
  switch (id) {
    case 'carrier':
      return (
        <>
          <path className="ship-hull" d={hullPath(length)} />
          <rect className="ship-deck" x={34} y={26} width={length - 90} height={48} rx={10} />
          <line className="ship-runway" x1={70} y1={50} x2={length - 90} y2={50} strokeDasharray="24 20" />
          <rect className="ship-detail" x={length * 0.6} y={12} width={52} height={22} rx={5} />
        </>
      )
    case 'battleship':
      return (
        <>
          <path className="ship-hull" d={hullPath(length)} />
          <Turret x={length * 0.26} />
          <Funnel x={length * 0.44} />
          <Turret x={length * 0.7} />
        </>
      )
    case 'cruiser':
      return (
        <>
          <path className="ship-hull" d={hullPath(length)} />
          <Turret x={length * 0.28} />
          <Funnel x={length * 0.5} />
        </>
      )
    case 'submarine':
      return (
        <>
          <path className="ship-hull" d={subPath(length)} />
          <rect className="ship-detail" x={length * 0.4} y={46} width={length * 0.3} height={8} rx={4} />
          <circle className="ship-detail" cx={length * 0.4} cy={50} r={17} />
        </>
      )
    case 'destroyer':
      return (
        <>
          <path className="ship-hull" d={hullPath(length)} />
          <Turret x={length * 0.32} />
          <Funnel x={length * 0.6} />
        </>
      )
  }
}

/** The board silhouette shrunk to an inline glyph, used in fleet and placement lists. */
export function ShipGlyph({ id, size, sunk = false }: { id: ShipId; size: number; sunk?: boolean }) {
  const length = size * CELL_UNITS
  return (
    <svg
      className={`ship-glyph ${sunk ? 'sunk' : ''}`}
      style={{ width: `calc(var(--glyph-unit) * ${size})` }}
      viewBox={`0 0 ${length} ${CELL_UNITS}`}
      aria-hidden="true"
    >
      {shipArt(id, length)}
    </svg>
  )
}

/**
 * Footprint of a ship in board coordinates, expressed with the `--cell` / `--gap`
 * custom properties so sprites track the responsive cell size.
 */
function footprint(cells: Coord[]) {
  const step = 'calc(var(--cell) + var(--gap))'
  const size = cells.length
  const long = `calc(${size} * var(--cell) + ${size - 1} * var(--gap))`
  const row = Math.min(...cells.map((cell) => cell.row))
  const col = Math.min(...cells.map((cell) => cell.col))
  const horizontal = cells.every((cell) => cell.row === cells[0].row)

  if (horizontal) {
    return {
      left: `calc(${col} * ${step})`,
      top: `calc(${row} * ${step})`,
      width: long,
      height: 'var(--cell)',
    }
  }

  // Sprites are drawn bow-right, so a vertical ship is rotated about the centre of its footprint.
  return {
    left: `calc(${col} * ${step} + var(--cell) / 2 - (${long}) / 2)`,
    top: `calc(${row} * ${step} + (${long}) / 2 - var(--cell) / 2)`,
    width: long,
    height: 'var(--cell)',
    transform: 'rotate(90deg)',
  }
}

interface ShipSpriteProps {
  id: ShipId
  cells: Coord[]
  sunk?: boolean
  ghost?: 'valid' | 'invalid'
}

export function ShipSprite({ id, cells, sunk = false, ghost }: ShipSpriteProps) {
  const length = cells.length * CELL_UNITS
  const classes = ['ship-sprite']
  if (sunk) classes.push('sunk')
  if (ghost) classes.push(`ghost-${ghost}`)

  return (
    <svg
      className={classes.join(' ')}
      style={footprint(cells)}
      viewBox={`0 0 ${length} ${CELL_UNITS}`}
      aria-hidden="true"
    >
      {shipArt(id, length)}
    </svg>
  )
}
