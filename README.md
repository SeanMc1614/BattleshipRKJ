# ⚓ Battleship

A kid-friendly browser version of classic Battleship, built with React, TypeScript and Vite. No accounts, no backend — open it and play.

## Modes

- **Play the computer** — one player against Sardaukar, in *Normal* (the default: hunts in a checkerboard pattern and finishes off ships it has wounded) or *Easy* (fires at random).
- **Head to head** — two players on the same device. A "pass the screen" screen hides each player's board between turns.

## Rules as implemented

- 10×10 grid, five ships: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2).
- Ships are placed horizontally or vertically, may not overlap, and cannot hang off the board. "Place for me 🎲" drops a random legal fleet.
- Players alternate one shot per turn. `✖` marks a hit, `•` marks a splash. Squares already fired at cannot be reused.
- Sinking all five of the opponent's ships wins the game.

## Running locally

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm test         # unit tests for the game rules and AI (Vitest)
npm run lint     # oxlint
npm run typecheck
npm run build    # production build into dist/
```

## Layout

- `src/game/types.ts` — board size, ship kinds, phase/state types.
- `src/game/board.ts` — placement validation, random fleets, firing and sink detection.
- `src/game/ai.ts` — computer opponent target selection.
- `src/components/` — board grid, ship placement screen, fleet status panels.
- `src/App.tsx` — screen flow: menu → placement → battle → winner.
