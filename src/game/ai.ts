import { alreadyFired, coordKey, isSunk } from './board'
import { BOARD_SIZE, type Coord, type Difficulty, type Fleet } from './types'

function allCells(): Coord[] {
  const cells: Coord[] = []
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) cells.push({ row, col })
  }
  return cells
}

function pick(cells: Coord[], random: () => number): Coord {
  return cells[Math.floor(random() * cells.length)]
}

/** Hits that belong to ships still afloat, i.e. leads worth following up. */
function openHits(fleet: Fleet): Coord[] {
  const sunkCells = new Set(
    fleet.ships.filter(isSunk).flatMap((ship) => ship.cells.map(coordKey)),
  )
  return fleet.incoming
    .filter((shot) => shot.result === 'hit' && !sunkCells.has(coordKey(shot)))
    .map(({ row, col }) => ({ row, col }))
}

function neighbours({ row, col }: Coord): Coord[] {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ].filter((c) => c.row >= 0 && c.row < BOARD_SIZE && c.col >= 0 && c.col < BOARD_SIZE)
}

/**
 * Chooses the AI's next target against `fleet`.
 * Easy fires at random; normal hunts on a checkerboard and finishes off wounded ships.
 */
export function chooseAiShot(fleet: Fleet, difficulty: Difficulty, random: () => number = Math.random): Coord {
  const untried = allCells().filter((cell) => !alreadyFired(fleet, cell))

  if (difficulty === 'normal') {
    const leads = openHits(fleet)
    const followUps = leads
      .flatMap(neighbours)
      .filter((cell) => !alreadyFired(fleet, cell))
    if (followUps.length > 0) {
      // Prefer continuing along an established line of hits.
      const inLine = followUps.filter((cell) =>
        leads.some((lead) => lead.row === cell.row || lead.col === cell.col) &&
        leads.filter((lead) => lead.row === cell.row || lead.col === cell.col).length > 1,
      )
      return pick(inLine.length > 0 ? inLine : followUps, random)
    }
    const parity = untried.filter((cell) => (cell.row + cell.col) % 2 === 0)
    if (parity.length > 0) return pick(parity, random)
  }

  return pick(untried, random)
}
