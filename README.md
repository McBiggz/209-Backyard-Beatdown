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
