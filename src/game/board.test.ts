import { describe, expect, it } from 'vitest'
import { canPlace, fireAt, isSunk, placeShip, randomFleet, shipCells } from './board'
import { BOARD_SIZE, SHIP_KINDS, type Ship } from './types'

const destroyer = SHIP_KINDS.find((kind) => kind.id === 'destroyer')!
const carrier = SHIP_KINDS.find((kind) => kind.id === 'carrier')!

describe('placement', () => {
  it('rejects ships that run off the board', () => {
    expect(canPlace([], shipCells(carrier, { row: 0, col: BOARD_SIZE - 2 }, 'horizontal'))).toBe(false)
    expect(canPlace([], shipCells(carrier, { row: 0, col: 0 }, 'horizontal'))).toBe(true)
  })

  it('rejects overlapping ships', () => {
    const ships = placeShip([], carrier, { row: 3, col: 0 }, 'horizontal')!
    expect(placeShip(ships, destroyer, { row: 3, col: 4 }, 'vertical')).toBeNull()
    expect(placeShip(ships, destroyer, { row: 4, col: 4 }, 'vertical')).not.toBeNull()
  })

  it('places a full fleet at random without overlaps', () => {
    const fleet = randomFleet()
    expect(fleet.ships).toHaveLength(SHIP_KINDS.length)
    const cells = fleet.ships.flatMap((ship) => ship.cells.map((c) => `${c.row},${c.col}`))
    expect(new Set(cells).size).toBe(cells.length)
  })
})

describe('firing', () => {
  const fleet = { ships: placeShip([], destroyer, { row: 0, col: 0 }, 'horizontal')!, incoming: [] }

  it('reports misses and hits', () => {
    expect(fireAt(fleet, { row: 5, col: 5 }).result).toBe('miss')
    expect(fireAt(fleet, { row: 0, col: 0 }).result).toBe('hit')
  })

  it('reports a sunk ship once every cell is hit and ends the game', () => {
    const first = fireAt(fleet, { row: 0, col: 0 })
    const second = fireAt(first.fleet, { row: 0, col: 1 })
    expect(second.result).toBe('sunk')
    expect(second.allSunk).toBe(true)
    expect(isSunk(second.fleet.ships[0] as Ship)).toBe(true)
  })

  it('records every shot so squares cannot be fired at twice', () => {
    const after = fireAt(fleet, { row: 2, col: 2 }).fleet
    expect(after.incoming).toHaveLength(1)
  })
})
