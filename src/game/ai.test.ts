import { describe, expect, it } from 'vitest'
import { chooseAiShot } from './ai'
import { alreadyFired, fireAt, placeShip } from './board'
import { BOARD_SIZE, SHIP_KINDS, type Fleet } from './types'

const carrier = SHIP_KINDS.find((kind) => kind.id === 'carrier')!

function fleetWithCarrier(): Fleet {
  return { ships: placeShip([], carrier, { row: 4, col: 2 }, 'horizontal')!, incoming: [] }
}

describe('chooseAiShot', () => {
  it('never repeats a square', () => {
    let fleet = fleetWithCarrier()
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i += 1) {
      const shot = chooseAiShot(fleet, 'normal')
      expect(alreadyFired(fleet, shot)).toBe(false)
      fleet = fireAt(fleet, shot).fleet
    }
  })

  it('follows up next to a hit on normal difficulty', () => {
    const fleet = fireAt(fleetWithCarrier(), { row: 4, col: 2 }).fleet
    const shot = chooseAiShot(fleet, 'normal')
    const distance = Math.abs(shot.row - 4) + Math.abs(shot.col - 2)
    expect(distance).toBe(1)
  })

  it('sinks a whole ship within a reasonable number of shots on normal', () => {
    let fleet = fireAt(fleetWithCarrier(), { row: 4, col: 2 }).fleet
    for (let i = 0; i < 12 && !fleet.ships.every((ship) => ship.hits === ship.cells.length); i += 1) {
      fleet = fireAt(fleet, chooseAiShot(fleet, 'normal')).fleet
    }
    expect(fleet.ships[0].hits).toBe(carrier.size)
  })
})
