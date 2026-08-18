---
name: testing-battleship
description: How to run and end-to-end test the Battleship React+TS+Vite app, including verifying Web Audio / speechSynthesis behaviour on a headless VM where sound cannot be heard.
---

# Testing the Battleship web game

## Running the app
- Node 22 is required (Vite 8's rolldown native binding fails on Node 20):
  `export NVM_DIR=~/.nvm && . $NVM_DIR/nvm.sh && nvm use 22 && npm install && npm run dev` → http://localhost:5173
- Static app, no backend, no credentials.
- Useful scripts: `npm test` (Vitest for `src/game`), `npm run lint`, `npm run typecheck`, `npm run build`.

## UI facts that make automation easy
- Every board cell is a `<button>` with `aria-label` like `"<Name>'s waters — shoot here E5"`, and the
  suffix `— hit` / `— miss` is appended once resolved. Use these labels as ground truth for pegs instead
  of reading pixels; `disabled` attributes prove board locking.
- Phase machine: menu → placement → handoff (hot-seat only) → battle → gameover. Handoff/"Pass the screen
  to X" screens should contain **zero** board buttons — a DOM count is the cleanest anti-cheat assertion.
- Deterministic ship layouts: in hot-seat, place one player's fleet manually with the default
  "Rotate: across ↔" (e.g. Carrier A1–E1, Battleship A3–D3, Cruiser A5–C5, Submarine A7–C7,
  Destroyer A9–B9). This lets you assert that a spoken/logged ship name matches the ship really at
  that coordinate, and lets you sink the 2-cell Destroyer in two shots.

## Verifying sound when audio is inaudible (headless VM)
Audio can't be heard, so instrument the page instead of trusting your ears. Inject (over CDP
`Page.addScriptToEvaluateOnNewDocument`, so it survives reloads) wrappers around:
`AudioContext.prototype.createOscillator`, `AudioContext.prototype.createBufferSource`,
`window.speechSynthesis.speak`. Log for each call: a `+ms` timestamp, the spoken text, and the
originating sound helper (derived from `new Error().stack` — names like `playWhistle`,
`playExplosion`, `playSplash`). Render the log into a fixed-position on-page overlay with counters
`osc / bufsrc / speak / err` so the evidence is visible in screenshots and screen recordings; also
count `window.onerror` / `console.error` into `err`.
Gotcha: registering the script over a CDP WebSocket that then closes loses the registration — keep the
socket open (a small persistent Python `websockets` client works well) and re-inject on navigation.

Expected timings to assert (see `src/sound.ts` / `src/App.tsx`): whistle → impact ≈ 1000 ms
(`WHISTLE_MS`), hit/sunk speech ≈ 450 ms after the explosion (`VOICE_DELAY_MS`), AI shot ≈ 900 ms after
the previous resolution (`AI_DELAY_MS`). Miss = splash and **no** speech.

## Mute
Header 🔊/🔇 toggle persists in `localStorage['battleship-sound']` (`'on'` / `'off'`). A freshly created
browser profile may already be muted from a previous session — always check the header icon before
asserting that sounds fire. While muted, no audio nodes and no `speechSynthesis.speak` calls should
occur, including on hits and sinks.

## Timing caveat
The flight is only 1 s, and computer-use screenshots can take longer than that; if you need mid-flight
evidence, click and screenshot in a single batched action call, and rely on the timestamped audio log
rather than screenshots for exact timings.
