# RPC homepage — energy-first mockup (v2)

Mockup preview of the RPC homepage, built on the latest demo at `design.onlineasset.co.th/demo/ir/RPC/` and reworked so the energy business (PTEC × Caltex) leads the story. Design tokens, components and motion follow the original demo.

| File | What it is |
|---|---|
| `index.html` | The v2 homepage mockup |
| `business.html` | "ธุรกิจของเรา" page with the same energy-first treatment |
| About-us pages | `about-history.html`, `company-information.html`, `vision-and-mission.html` (energy-first rework); `chairman-statement.html`, `board-of-directors.html`, `organization-chart.html`, `shareholding.html` (name + banner only) |
| Investor relations | `index-ir.html` (energy-first rework, revenue-by-segment bar); 9 sub-pages (name + banner only) |
| Contact and policies | `contact.html` (energy line, plant tag, affiliate contacts); `documents-company-policy`, `cookie-policy`, `privacy-policy`, `complaint-channel`, `read-detail`, `unsub-email-alert` (name + banner only) |
| `compare.html` | Before / after screenshots and the change list for the web team |
| `_compare/` | Screenshots used by `compare.html` |
| `serve.js` | Static dev server (port 5172) |

## Run

```bash
node serve.js
```

Open http://localhost:5172 and http://localhost:5172/compare.html

## What changed from the demo

- Section order: Hero → about RPC → our business (PTEC, then SAMCO as an affiliate card) → energy products → investors → ESG → opportunity → news / contact.
- Hero: a 10-second simulated film replaces the video (to be swapped for the real one), following the Energy-Led Ecosystem script: Establish → Reveal → Expand → Unify → lockup, looping on its own (`assets/js/film.js`). One energy card with 81.9% / 80 stations / EURO 5; the SAMCO shortcut scrolls to the affiliate card in the business section.
- About: energy roots from the IR site (founded 2538 as Rayong Purifier, Map Ta Phut plant, Section 7 oil-trader licence).
- Business: single PTEC panel, no slider, followed by a compact SAMCO card.
- Products: four energy items on the Moving Forward rail (01 / 04), real-estate items removed.
- ESG starts with solar rooftop; opportunity reduced to two cards.
- Company name RPCG / อาร์พีซีจี replaced with RPC / อาร์พีซี throughout.

## Notes

- **Fonts are included** (FC Minimal and the Material Symbols subset in `assets/font/`) so Git-based Vercel deployments render the same as local previews. FC Minimal is a licensed font; this was the repo owner's decision.
- Figures: revenue 10,280 / 8,980 / 8,371 MB (2566–2568), history and licence come from rpc-th.listedcompany.com; 81.9% / 17.7% / 80 stations / 12 solar-rooftop stations from the original demo.
- Section backgrounds use blue duotone crops of the existing Caltex photo (`assets/img/energy/`) instead of city imagery.
- The solar-rooftop card uses an existing demo image (city with wind turbines) as a stand-in.
- Film stills in `assets/img/film/` are frames taken from the original demo video; the energy-infrastructure shots (0–4s) still need real footage.
