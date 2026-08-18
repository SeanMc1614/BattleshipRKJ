import { useEffect, useState } from 'react'
import { Board } from './components/Board'
import { FleetStatus } from './components/FleetStatus'
import { Placement } from './components/Placement'
import { chooseAiShot } from './game/ai'
import { coordLabel, emptyFleet, fireAt, randomFleet } from './game/board'
import type { Coord, Difficulty, Fleet, GameMode, Phase, PlayerIndex } from './game/types'
import './App.css'

const AI_NAME = 'Captain Robot 🤖'
const AI_DELAY_MS = 900

function other(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0
}

export default function App() {
  const [mode, setMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [names, setNames] = useState<[string, string]>(['Player 1', 'Player 2'])
  const [fleets, setFleets] = useState<[Fleet, Fleet]>([emptyFleet(), emptyFleet()])
  const [phase, setPhase] = useState<Phase>({ name: 'menu' })
  const [message, setMessage] = useState('')

  const playerName = (player: PlayerIndex) => (mode === 'ai' && player === 1 ? AI_NAME : names[player])

  function startGame() {
    setFleets([emptyFleet(), emptyFleet()])
    setMessage('')
    setPhase({ name: 'placement', player: 0 })
  }

  function backToMenu() {
    setPhase({ name: 'menu' })
    setMessage('')
  }

  function handlePlacementDone(player: PlayerIndex, fleet: Fleet) {
    if (mode === 'ai') {
      setFleets([fleet, randomFleet()])
      setMessage(`Your turn, ${names[0]}. Take a shot!`)
      setPhase({ name: 'battle', player: 0 })
      return
    }
    if (player === 0) {
      setFleets([fleet, emptyFleet()])
      setPhase({ name: 'handoff', player: 1 })
      return
    }
    setFleets(([first]) => [first, fleet])
    setMessage(`${names[0]} shoots first!`)
    setPhase({ name: 'handoff', player: 0 })
  }

  function describe(shooter: string, cell: Coord, result: string, shipName?: string) {
    if (result === 'sunk') return `${shooter} sank the ${shipName} at ${coordLabel(cell)}! 🔥`
    if (result === 'hit') return `${shooter} hit a ship at ${coordLabel(cell)}! 💥`
    return `${shooter} missed at ${coordLabel(cell)}. 🌊`
  }

  function fire(shooter: PlayerIndex, cell: Coord) {
    const targetIndex = other(shooter)
    const outcome = fireAt(fleets[targetIndex], cell)
    const nextFleets: [Fleet, Fleet] = shooter === 0 ? [fleets[0], outcome.fleet] : [outcome.fleet, fleets[1]]
    setFleets(nextFleets)
    setMessage(describe(playerName(shooter), cell, outcome.result, outcome.ship?.name))

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
    if (!aiTurn) return
    const timer = setTimeout(() => fire(1, chooseAiShot(fleets[0], difficulty)), AI_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, fleets, difficulty])

  if (phase.name === 'menu') {
    return (
      <main className="app">
        <Header />
        <section className="screen menu">
          <h2>Choose your game</h2>
          <div className="mode-cards">
            <button
              type="button"
              className={`mode-card ${mode === 'ai' ? 'selected' : ''}`}
              onClick={() => setMode('ai')}
            >
              <span className="mode-emoji">🤖</span>
              <strong>Play the computer</strong>
              <small>One player vs {AI_NAME}</small>
            </button>
            <button
              type="button"
              className={`mode-card ${mode === 'versus' ? 'selected' : ''}`}
              onClick={() => setMode('versus')}
            >
              <span className="mode-emoji">👨‍👧</span>
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
                    {level === 'easy' ? 'Easy 🐣' : 'Normal 🦈'}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="p1">Player 1 name</label>
            <input id="p1" value={names[0]} onChange={(e) => setNames([e.target.value, names[1]])} />
          </div>
          {mode === 'versus' ? (
            <div className="field">
              <label htmlFor="p2">Player 2 name</label>
              <input id="p2" value={names[1]} onChange={(e) => setNames([names[0], e.target.value])} />
            </div>
          ) : null}

          <button type="button" className="primary big" onClick={startGame}>
            Start game
          </button>
          <p className="rules">
            Sink all five of your opponent's ships to win. Each turn you fire one shot: ✖ is a hit, • is a splash.
          </p>
        </section>
      </main>
    )
  }

  if (phase.name === 'placement') {
    const player = phase.player
    return (
      <main className="app">
        <Header />
        <Placement
          key={player}
          playerName={names[player]}
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
        <Header />
        <section className="screen handoff">
          <h2>Pass the screen to {names[player]}</h2>
          {message ? <p className="message">{message}</p> : null}
          <p className="hint">No peeking! 🙈</p>
          <button
            type="button"
            className="primary big"
            onClick={() =>
              setPhase(needsPlacement ? { name: 'placement', player } : { name: 'battle', player })
            }
          >
            I'm {names[player]} — ready
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
      <Header />
      <section className="screen battle">
        {gameOver ? (
          <div className="banner win">
            <h2>{playerName(activePlayer)} wins! 🎉</h2>
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
            <h2>{aiTurn ? `${AI_NAME} is taking aim…` : `${playerName(viewer)}: fire away!`}</h2>
            <p className="message">{message}</p>
          </div>
        )}

        <div className="boards">
          <Board
            fleet={fleets[opponent]}
            revealShips={gameOver}
            label={`${playerName(opponent)}'s waters — shoot here`}
            disabled={gameOver || aiTurn}
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

function Header() {
  return (
    <header className="header">
      <h1>⚓ Battleship</h1>
    </header>
  )
}
