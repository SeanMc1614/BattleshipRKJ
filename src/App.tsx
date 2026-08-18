import { useEffect, useRef, useState, type FocusEvent } from 'react'
import { Board } from './components/Board'
import { FleetStatus } from './components/FleetStatus'
import {
  ClassifiedIcon,
  CrestIcon,
  DuelIcon,
  MissileIcon,
  PegIcon,
  RadarIcon,
  SoundIcon,
  TrophyIcon,
} from './components/Icons'
import { Placement } from './components/Placement'
import { chooseAiShot } from './game/ai'
import { coordLabel, emptyFleet, fireAt, randomFleet } from './game/board'
import type { Coord, Difficulty, Fleet, GameMode, Phase, PlayerIndex, ShotResult } from './game/types'
import { WHISTLE_MS, isSoundOn, playExplosion, playSplash, playWhistle, say, setSoundOn } from './sound'
import './App.css'

const AI_NAME = 'Captain Robot'
const AI_DELAY_MS = 900
const VOICE_DELAY_MS = 450
const DEFAULT_NAMES = ['Player 1', 'Player 2']

const selectAll = (event: FocusEvent<HTMLInputElement>) => event.target.select()

function other(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0
}

export default function App() {
  const [mode, setMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [names, setNames] = useState<[string, string]>(['', ''])
  const [fleets, setFleets] = useState<[Fleet, Fleet]>([emptyFleet(), emptyFleet()])
  const [phase, setPhase] = useState<Phase>({ name: 'menu' })
  const [message, setMessage] = useState('')
  const [incoming, setIncoming] = useState(false)
  const [lastResult, setLastResult] = useState<ShotResult | null>(null)
  const [soundOn, setSound] = useState(isSoundOn)
  const timers = useRef<number[]>([])

  const later = (fn: () => void, delay: number) => {
    timers.current.push(window.setTimeout(fn, delay))
  }

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  function toggleSound() {
    const next = !soundOn
    setSoundOn(next)
    setSound(next)
  }

  const playerName = (player: PlayerIndex) =>
    mode === 'ai' && player === 1 ? AI_NAME : names[player].trim() || DEFAULT_NAMES[player]

  function startGame() {
    clearTimers()
    setIncoming(false)
    setFleets([emptyFleet(), emptyFleet()])
    setMessage('')
    setLastResult(null)
    setPhase({ name: 'placement', player: 0 })
  }

  function backToMenu() {
    clearTimers()
    setIncoming(false)
    setPhase({ name: 'menu' })
    setMessage('')
    setLastResult(null)
  }

  function handlePlacementDone(player: PlayerIndex, fleet: Fleet) {
    if (mode === 'ai') {
      setFleets([fleet, randomFleet()])
      setMessage(`Your turn, ${playerName(0)}. Take a shot!`)
      setPhase({ name: 'battle', player: 0 })
      return
    }
    if (player === 0) {
      setFleets([fleet, emptyFleet()])
      setPhase({ name: 'handoff', player: 1 })
      return
    }
    setFleets(([first]) => [first, fleet])
    setMessage(`${playerName(0)} shoots first!`)
    setPhase({ name: 'handoff', player: 0 })
  }

  function describe(shooter: string, cell: Coord, result: string, shipName?: string) {
    if (result === 'sunk') return `${shooter} sank the ${shipName} at ${coordLabel(cell)}!`
    if (result === 'hit') return `${shooter} hit a ship at ${coordLabel(cell)}!`
    return `${shooter} missed at ${coordLabel(cell)}.`
  }

  /** A shot takes off first: whistle in the air, then the impact is revealed. */
  function fire(shooter: PlayerIndex, cell: Coord) {
    if (incoming) return
    setIncoming(true)
    setLastResult(null)
    setMessage(`Shot away at ${coordLabel(cell)}…`)
    playWhistle()
    later(() => resolveShot(shooter, cell), WHISTLE_MS)
  }

  function resolveShot(shooter: PlayerIndex, cell: Coord) {
    const targetIndex = other(shooter)
    const outcome = fireAt(fleets[targetIndex], cell)
    const nextFleets: [Fleet, Fleet] = shooter === 0 ? [fleets[0], outcome.fleet] : [outcome.fleet, fleets[1]]
    setFleets(nextFleets)
    setMessage(describe(playerName(shooter), cell, outcome.result, outcome.ship?.name))
    setLastResult(outcome.result)
    setIncoming(false)

    if (outcome.result === 'miss') {
      playSplash()
    } else {
      playExplosion()
      const shipName = outcome.ship?.name ?? 'ship'
      const line = outcome.result === 'sunk' ? `${shipName} sunk!` : `Hit! ${shipName}`
      later(() => say(line), VOICE_DELAY_MS)
    }

    if (outcome.allSunk) {
      setPhase({ name: 'gameover', winner: shooter })
      return
    }
    if (mode === 'ai') {
      setPhase({ name: 'battle', player: targetIndex })
    } else {
      setPhase({ name: 'handoff', player: targetIndex })
    }
  }

  const aiTurn = mode === 'ai' && phase.name === 'battle' && phase.player === 1
  useEffect(() => {
    if (!aiTurn || incoming) return
    const timer = setTimeout(() => fire(1, chooseAiShot(fleets[0], difficulty)), AI_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, incoming, fleets, difficulty])

  if (phase.name === 'menu') {
    return (
      <main className="app">
        <Header soundOn={soundOn} onToggleSound={toggleSound} />
        <section className="screen menu">
          <h2>Choose your game</h2>
          <div className="mode-cards">
            <button
              type="button"
              className={`mode-card ${mode === 'ai' ? 'selected' : ''}`}
              onClick={() => setMode('ai')}
            >
              <RadarIcon className="mode-icon" />
              <strong>Play the computer</strong>
              <small>One player vs {AI_NAME}</small>
            </button>
            <button
              type="button"
              className={`mode-card ${mode === 'versus' ? 'selected' : ''}`}
              onClick={() => setMode('versus')}
            >
              <DuelIcon className="mode-icon" />
              <strong>Head to head</strong>
              <small>Two players, pass the screen</small>
            </button>
          </div>

          {mode === 'ai' ? (
            <div className="field">
              <span>How tough is the computer?</span>
              <div className="controls">
                {(['easy', 'normal'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={difficulty === level ? 'primary' : ''}
                    onClick={() => setDifficulty(level)}
                  >
                    {level === 'easy' ? 'Easy' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="p1">Player 1 name</label>
            <input
              id="p1"
              value={names[0]}
              placeholder={DEFAULT_NAMES[0]}
              onFocus={selectAll}
              onChange={(e) => setNames([e.target.value, names[1]])}
            />
          </div>
          {mode === 'versus' ? (
            <div className="field">
              <label htmlFor="p2">Player 2 name</label>
              <input
                id="p2"
                value={names[1]}
                placeholder={DEFAULT_NAMES[1]}
                onFocus={selectAll}
                onChange={(e) => setNames([names[0], e.target.value])}
              />
            </div>
          ) : null}

          <button type="button" className="primary big" onClick={startGame}>
            Start game
          </button>
          <p className="rules">
            Sink all five of your opponent's ships to win. Each turn you fire one shot: a red peg is a hit, a
            white peg is a splash.
          </p>
        </section>
      </main>
    )
  }

  if (phase.name === 'placement') {
    const player = phase.player
    return (
      <main className="app">
        <Header soundOn={soundOn} onToggleSound={toggleSound} />
        <Placement
          key={player}
          playerName={playerName(player)}
          onDone={(fleet) => handlePlacementDone(player, fleet)}
        />
      </main>
    )
  }

  if (phase.name === 'handoff') {
    const player = phase.player
    const needsPlacement = fleets[player].ships.length === 0
    return (
      <main className="app">
        <Header soundOn={soundOn} onToggleSound={toggleSound} />
        <section className="screen handoff">
          <h2>Pass the screen to {playerName(player)}</h2>
          {message ? <p className="message">{message}</p> : null}
          <p className="hint">
            <ClassifiedIcon /> Classified — no peeking!
          </p>
          <button
            type="button"
            className="primary big"
            onClick={() =>
              setPhase(needsPlacement ? { name: 'placement', player } : { name: 'battle', player })
            }
          >
            I'm {playerName(player)} — ready
          </button>
        </section>
      </main>
    )
  }

  const activePlayer: PlayerIndex = phase.name === 'battle' ? phase.player : phase.winner
  // In AI mode the human always sees their own side of the board.
  const viewer: PlayerIndex = mode === 'ai' ? 0 : activePlayer
  const opponent = other(viewer)
  const gameOver = phase.name === 'gameover'

  return (
    <main className="app">
      <Header soundOn={soundOn} onToggleSound={toggleSound} />
      <section className="screen battle">
        {gameOver ? (
          <div className="banner win">
            <h2>
              <TrophyIcon /> {playerName(activePlayer)} wins!
            </h2>
            <div className="controls">
              <button type="button" className="primary" onClick={startGame}>
                Play again
              </button>
              <button type="button" onClick={backToMenu}>
                Main menu
              </button>
            </div>
          </div>
        ) : (
          <div className="banner">
            <h2>
              {incoming ? (
                <>
                  <MissileIcon /> Shot in the air…
                </>
              ) : aiTurn ? (
                `${AI_NAME} is taking aim…`
              ) : (
                `${playerName(viewer)}: fire away!`
              )}
            </h2>
            <p className="message">
              {lastResult ? <PegIcon result={lastResult} /> : null}
              {message}
            </p>
          </div>
        )}

        <div className="boards">
          <Board
            fleet={fleets[opponent]}
            revealShips={gameOver}
            label={`${playerName(opponent)}'s waters — shoot here`}
            disabled={gameOver || aiTurn || incoming}
            onCellClick={(cell) => fire(viewer, cell)}
          />
          <Board fleet={fleets[viewer]} revealShips label={`${playerName(viewer)}'s waters`} disabled />
        </div>

        <div className="statuses">
          <FleetStatus title={`${playerName(opponent)}'s fleet`} fleet={fleets[opponent]} />
          <FleetStatus title={`${playerName(viewer)}'s fleet`} fleet={fleets[viewer]} />
        </div>

        {!gameOver ? (
          <button type="button" className="quit" onClick={backToMenu}>
            Quit to menu
          </button>
        ) : null}
      </section>
    </main>
  )
}

function Header({ soundOn, onToggleSound }: { soundOn: boolean; onToggleSound: () => void }) {
  return (
    <header className="header">
      <h1>
        <CrestIcon className="crest" />
        <span className="wordmark">Battleship</span>
      </h1>
      <button
        type="button"
        className={`sound-toggle ${soundOn ? '' : 'muted'}`}
        aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        aria-pressed={soundOn}
        onClick={onToggleSound}
      >
        <SoundIcon muted={!soundOn} />
        <span>{soundOn ? 'Sound on' : 'Muted'}</span>
      </button>
    </header>
  )
}
