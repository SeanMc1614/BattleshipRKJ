import { allCoords, alreadyFired, cellKeys, coordKey, inBounds, isSunk } from './board'
import { type Coord, type Difficulty, type Fleet } from './types'

function pick(cells: Coord[], random: () => number): Coord {
  return cells[Math.floor(random() * cells.length)]
}

/** Hits that belong to ships still afloat, i.e. leads worth following up. */
function openHits(fleet: Fleet): Coord[] {
  const sunkCells = cellKeys(fleet.ships.filter(isSunk))
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
  ].filter(inBounds)
}

/**
 * Chooses the AI's next target against `fleet`.
 * Easy fires at random; normal hunts on a checkerboard and finishes off wounded ships.
 */
export function chooseAiShot(fleet: Fleet, difficulty: Difficulty, random: () => number = Math.random): Coord {
  const untried = allCoords().filter((cell) => !alreadyFired(fleet, cell))

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
