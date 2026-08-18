import {
  BOARD_SIZE,
  SHIP_KINDS,
  type Coord,
  type Fleet,
  type Orientation,
  type Ship,
  type ShipKind,
  type Shot,
  type ShotResult,
} from './types'

export const COLUMN_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i))

export function coordKey({ row, col }: Coord): string {
  return `${row},${col}`
}

export function coordLabel({ row, col }: Coord): string {
  return `${COLUMN_LABELS[col]}${row + 1}`
}

export function shipCells(kind: ShipKind, start: Coord, orientation: Orientation): Coord[] {
  return Array.from({ length: kind.size }, (_, i) =>
    orientation === 'horizontal'
      ? { row: start.row, col: start.col + i }
      : { row: start.row + i, col: start.col },
  )
}

function inBounds({ row, col }: Coord): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function canPlace(ships: Ship[], cells: Coord[]): boolean {
  if (!cells.every(inBounds)) return false
  const taken = new Set(ships.flatMap((ship) => ship.cells.map(coordKey)))
  return cells.every((cell) => !taken.has(coordKey(cell)))
}

export function placeShip(ships: Ship[], kind: ShipKind, start: Coord, orientation: Orientation): Ship[] | null {
  const cells = shipCells(kind, start, orientation)
  if (!canPlace(ships, cells)) return null
  return [...ships, { id: kind.id, name: kind.name, cells, hits: 0 }]
}

export function emptyFleet(): Fleet {
  return { ships: [], incoming: [] }
}

export function randomFleet(random: () => number = Math.random): Fleet {
  let ships: Ship[] = []
  for (const kind of SHIP_KINDS) {
    let placed: Ship[] | null = null
    while (!placed) {
      const orientation: Orientation = random() < 0.5 ? 'horizontal' : 'vertical'
      const start = {
        row: Math.floor(random() * BOARD_SIZE),
        col: Math.floor(random() * BOARD_SIZE),
      }
      placed = placeShip(ships, kind, start, orientation)
    }
    ships = placed
  }
  return { ships, incoming: [] }
}

export function shipAt(ships: Ship[], cell: Coord): Ship | undefined {
  return ships.find((ship) => ship.cells.some((c) => c.row === cell.row && c.col === cell.col))
}

export function isSunk(ship: Ship): boolean {
  return ship.hits >= ship.cells.length
}

export function alreadyFired(fleet: Fleet, cell: Coord): boolean {
  return fleet.incoming.some((shot) => shot.row === cell.row && shot.col === cell.col)
}

export interface FireOutcome {
  fleet: Fleet
  result: ShotResult
  ship?: Ship
  allSunk: boolean
}

/** Applies a shot at `cell` against `fleet`, returning the updated fleet. */
export function fireAt(fleet: Fleet, cell: Coord): FireOutcome {
  const target = shipAt(fleet.ships, cell)
  let result: ShotResult = 'miss'
  let updatedShip: Ship | undefined

  const ships = fleet.ships.map((ship) => {
    if (ship !== target) return ship
    updatedShip = { ...ship, hits: ship.hits + 1 }
    result = isSunk(updatedShip) ? 'sunk' : 'hit'
    return updatedShip
  })

  const shot: Shot = { ...cell, result }
  const updated: Fleet = { ships, incoming: [...fleet.incoming, shot] }
  return { fleet: updated, result, ship: updatedShip, allSunk: ships.every(isSunk) }
}

export function shotAt(fleet: Fleet, cell: Coord): Shot | undefined {
  return fleet.incoming.find((shot) => shot.row === cell.row && shot.col === cell.col)
}

export function remainingShips(fleet: Fleet): Ship[] {
  return fleet.ships.filter((ship) => !isSunk(ship))
}
