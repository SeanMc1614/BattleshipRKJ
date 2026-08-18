export const BOARD_SIZE = 10

export type Orientation = 'horizontal' | 'vertical'

export type ShipId = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'

export interface ShipKind {
  id: ShipId
  name: string
  size: number
}

export const SHIP_KINDS: ShipKind[] = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
]

export interface Coord {
  row: number
  col: number
}

export interface Ship {
  id: ShipId
  name: string
  cells: Coord[]
  hits: number
}

export type ShotResult = 'miss' | 'hit' | 'sunk'

export interface Shot extends Coord {
  result: ShotResult
}

export interface Fleet {
  ships: Ship[]
  /** Shots that the opponent has fired at this fleet. */
  incoming: Shot[]
}

export type GameMode = 'ai' | 'versus'

export type Difficulty = 'easy' | 'normal'

export type PlayerIndex = 0 | 1

export type Phase =
  | { name: 'menu' }
  | { name: 'placement'; player: PlayerIndex }
  | { name: 'handoff'; player: PlayerIndex }
  | { name: 'battle'; player: PlayerIndex }
  | { name: 'gameover'; winner: PlayerIndex }
