import type { ShipId } from '../game/types'
import { ShipGlyph } from './ShipSprite'

interface ShipRowProps {
  id: ShipId
  size: number
  name: string
  /** Right-hand column: the ship's length while placing, its damage in battle. */
  tally: string
  sunk?: boolean
  className?: string
}

/** One line of a fleet list: silhouette, name and tally. */
export function ShipRow({ id, size, name, tally, sunk = false, className = '' }: ShipRowProps) {
  return (
    <li className={className}>
      <ShipGlyph id={id} size={size} sunk={sunk} />
      <span className="ship-name">{name}</span>
      <span className="ship-tally">{tally}</span>
    </li>
  )
}
