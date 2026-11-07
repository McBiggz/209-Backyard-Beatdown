# 209 Dragon's Den: Backyard Brawl

A 16-bit wrestling game starring the roster of the 209 Dragon's Den.

## Layout

- `src/` — game code, one file per system, joined in the order listed in `src/_order.json`
- `data/` — wrestlers, moves and match rules as JSON (edit these, not code, to add or balance)
- `assets/` — sprite sheets, maps and logos
- `public/` — app icon and manifest for "Add to Home Screen"
- `tests/` — automated checks (determinism, full CPU matches)
- `build.mjs` — builds the playable page into `dist/index.html`

## Build

    node build.mjs

Open `dist/index.html` in a browser to play.

## Phase 0 engine notes
- **Fixed timing:** the game advances in exact 1/60 s steps (`simStep` in src/22_loop.js); drawing is separate.
- **Seeded randomness:** anything that changes a match uses `srnd/schance` (seeded per match). CPU brains use `arnd` (own stream). `rnd/pick` are cosmetic only (particles, crowd, shake).
- **Inputs:** keyboard, touch and CPU all become 9 buttons per step, packed into one number (`packInp`). Every match records `G.rec` = {seed, wrestlers, cpu flags, inputs}.
- **Replay / determinism test:** `python3 tests/determinism.py http://127.0.0.1:PORT/index.html` against `dist/` — plays seeded CPU matches twice, replays them from the tape only, and checks the state hashes match.
- **Data:** wrestlers, referee and strike tuning live in `data/roster.json` and `data/moves.json`; the build bakes them in.

## Hosting (Cloudflare Worker with static assets)
Cloudflare builds the site from this repo on every push to `main` (settings in `wrangler.jsonc`).
- Build command: `node build.mjs`
- Deploy command: `npx wrangler deploy`
- No packages need installing to build; `node_modules` is only for the local tests.

Online play uses the free public PeerJS server for matchmaking. To test against a local server instead, open the game with `?peerhost=127.0.0.1&peerport=9000` and run `node tests/peer_server.cjs`.
