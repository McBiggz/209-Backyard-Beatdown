# Sprite tools

Turns Liam's ChatGPT sheets (magenta background) into the game's sprite sheets (`assets/sprites/<id>.webp`)
and their frame lists (in `src/03_assets.js`).

- `art_src/batch1/` – new move sheets for the original roster + Viral's sheets
- `art_src/batch2/` – full sheets for the newer wrestlers (`<id>_A..F`, pin, breathing, extras)
- `art_src/orig/` – the original roster's sheets before the new move art was added (the builders start from these)

| Script | What it builds |
|---|---|
| `build_viral.py` | Viral's new frames on top of his original sheet |
| `build_roster_batch1.py [ids]` | New move art for the original roster (suplex, pins, leapfrog, signature) |
| `build_roster_batch2.py ids` | Full sheets for Tripp, Jason, Frank, Flaco, Jaguar, Kruze, Razzle |
| `audit_sizes.py out.json` | Size audit: every frame vs the wrestler's own stance (Viral is the ruler) |
| `prompts_*.py / .js` | Generates the Full Frame Prompts doc |

Size corrections from the 2026-11-14 audit are inside the builders (`GM`, `FM`, `FOLD` in batch1; `SS`/per-frame in batch2;
`data/sheetscale.json`). After building, run `python3 tools/sprites/pack.py` (packs every sheet into a tight atlas in `assets/sprites_packed/` and writes `src/03b_pack.js`), then `node build.mjs`. The build stops if a sheet changed without re-packing.

New wrestler: add his entry to `HD` in `src/03_assets.js` as `"<id>": {"src": "SPR(sprites/<id>.webp)", "names": [...], "cols": 8}` before packing.
