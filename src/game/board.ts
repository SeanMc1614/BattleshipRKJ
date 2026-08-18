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

/** 0…BOARD_SIZE-1, for iterating rows and columns. */
export const BOARD_INDICES = Array.from({ length: BOARD_SIZE }, (_, i) => i)

export const COLUMN_LABELS = BOARD_INDICES.map((i) => String.fromCharCode(65 + i))

export function coordKey({ row, col }: Coord): string {
  return `${row},${col}`
}

export function sameCoord(a: Coord, b: Coord): boolean {
  return a.row === b.row && a.col === b.col
}

export function allCoords(): Coord[] {
  return BOARD_INDICES.flatMap((row) => BOARD_INDICES.map((col) => ({ row, col })))
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

export function inBounds({ row, col }: Coord): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

/** Keys of every cell occupied by `ships`, for O(1) lookups. */
export function cellKeys(ships: Ship[]): Set<string> {
  return new Set(ships.flatMap((ship) => ship.cells.map(coordKey)))
}

export function canPlace(ships: Ship[], cells: Coord[]): boolean {
  if (!cells.every(inBounds)) return false
  const taken = cellKeys(ships)
  return cells.every((cell) => !taken.has(coordKey(cell)))
}

export function placeShip(ships: Ship[], kind: ShipKind, start: Coord, orientation: Orientation): Ship[] | null {
  const cells = shipCells(kind, start, orientation)
  if (!canPlace(ships, cells)) return null
  return [...ships, { id: kind.id, name: kind.name, cells, hits: 0 }]
}

/** A fresh fleet: ships in place, no shots taken yet. */
export function newFleet(ships: Ship[] = []): Fleet {
  return { ships, incoming: [] }
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
  return newFleet(ships)
}

export function shipAt(ships: Ship[], cell: Coord): Ship | undefined {
  return ships.find((ship) => ship.cells.some((c) => sameCoord(c, cell)))
}

export function isSunk(ship: Ship): boolean {
  return ship.hits >= ship.cells.length
}

export function alreadyFired(fleet: Fleet, cell: Coord): boolean {
  return shotAt(fleet, cell) !== undefined
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
  return fleet.incoming.find((shot) => sameCoord(shot, cell))
}

export function remainingShips(fleet: Fleet): Ship[] {
  return fleet.ships.filter((ship) => !isSunk(ship))
}
