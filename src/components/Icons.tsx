import type { ReactNode } from 'react'
import type { ShotResult } from '../game/types'

/** Line-art icons drawn in the style of the Electronic Battleship control panel. */

interface IconProps {
  className?: string
}

function Icon({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg className={`icon ${className ?? ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

export function CrestIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 2 3 5v7c0 5 3.7 8.6 9 10 5.3-1.4 9-5 9-10V5l-9-3Z" />
      <path className="icon-cut" d="M12 6.6 6.5 8.4v3.6c0 3.3 2.3 5.8 5.5 6.9 3.2-1.1 5.5-3.6 5.5-6.9V8.4L12 6.6Z" />
      <path d="M12 9.4 7.8 15h8.4L12 9.4Z" />
    </Icon>
  )
}

export function RadarIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle className="icon-line" cx="12" cy="12" r="9.2" />
      <circle className="icon-line" cx="12" cy="12" r="5.6" />
      <circle cx="12" cy="12" r="1.8" />
      <path className="icon-line" d="M12 12 20 7" />
      <path d="M18.4 4.6 21.6 6l-1.5 3.1-1.7-4.5Z" />
    </Icon>
  )
}

export function DuelIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect className="icon-line" x="2.4" y="4.6" width="8.6" height="14.8" rx="1.4" />
      <rect className="icon-line" x="13" y="4.6" width="8.6" height="14.8" rx="1.4" />
      <circle cx="5.4" cy="8" r="1.1" />
      <circle cx="8" cy="12" r="1.1" />
      <circle cx="5.4" cy="16" r="1.1" />
      <circle cx="16" cy="8" r="1.1" />
      <circle cx="18.6" cy="12" r="1.1" />
      <circle cx="16" cy="16" r="1.1" />
    </Icon>
  )
}

export function MissileIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M21.4 2.6c-4.5.3-8 1.9-10.6 4.8l-1.7 1.9 4.6 4.6 1.9-1.7c2.9-2.6 4.5-6.1 4.8-10.6h-.1Z" />
      <path className="icon-line" d="M8.2 12.1 3 17.3l1.4 1.4 2.2-.7-.7 2.2 1.4 1.4 5.2-5.2" />
    </Icon>
  )
}

export function ClassifiedIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path className="icon-line" d="M2.6 12S6.3 6 12 6s9.4 6 9.4 6-3.7 6-9.4 6-9.4-6-9.4-6Z" />
      <circle cx="12" cy="12" r="2.6" />
      <path className="icon-line icon-slash" d="M4 20 20 4" />
    </Icon>
  )
}

export function SoundIcon({ muted, className }: IconProps & { muted?: boolean }) {
  return (
    <Icon className={className}>
      <path d="M4 9.4h3.2L12 5.2v13.6L7.2 14.6H4V9.4Z" />
      {muted ? (
        <path className="icon-line icon-slash" d="M15.2 9.2l5.2 5.6M20.4 9.2l-5.2 5.6" />
      ) : (
        <>
          <path className="icon-line" d="M15.4 9.6a3.6 3.6 0 0 1 0 4.8" />
          <path className="icon-line" d="M18.2 7.4a7 7 0 0 1 0 9.2" />
        </>
      )}
    </Icon>
  )
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M7 4h10v4.4a5 5 0 0 1-10 0V4Z" />
      <path className="icon-line" d="M7 5.4H4.2v1.8A3.4 3.4 0 0 0 7.6 10.6M17 5.4h2.8v1.8a3.4 3.4 0 0 1-3.4 3.4" />
      <path d="M10.6 13.4h2.8V17h-2.8zM7 18.4h10V21H7z" />
    </Icon>
  )
}

/** Red peg for a hit, white peg for a miss — the plastic pieces from the box. */
export function PegIcon({ result, className }: IconProps & { result: ShotResult }) {
  return (
    <Icon className={`peg-icon peg-${result === 'miss' ? 'white' : 'red'} ${className ?? ''}`}>
      <circle className="peg-body" cx="12" cy="12" r="8.4" />
      <circle className="peg-shine" cx="9.4" cy="9" r="2.6" />
    </Icon>
  )
}
