# RPC homepage — energy-first mockup (v2)

Mockup preview of the RPC homepage, built on the latest demo at `design.onlineasset.co.th/demo/ir/RPC/` and reworked so the energy business (PTEC × Caltex) leads the story. Design tokens, components and motion follow the original demo.

| File | What it is |
|---|---|
| `index.html` | The v2 homepage mockup |
| `compare.html` | Before / after screenshots and the change list for the web team |
| `_compare/` | Screenshots used by `compare.html` |
| `serve.js` | Static dev server (port 5172) |

## Run

```bash
node serve.js
```

Open http://localhost:5172 and http://localhost:5172/compare.html

## What changed from the demo

- Section order: Hero → energy business (PTEC) → energy products → investors → about RPC → ESG → opportunity → news / contact.
- Hero: a simulated motion placeholder replaces the video (to be swapped for the real video); one energy card with 81.9% / 80 stations / EURO 5, SAMCO as a small affiliate link.
- Energy business: single PTEC panel, no slider.
- Products: four energy items on the Moving Forward rail (01 / 04), real-estate items removed.
- About: shortened; SAMCO shown as one affiliate tile.
- ESG starts with solar rooftop; opportunity reduced to two cards.
- Company name RPCG / อาร์พีซีจี replaced with RPC / อาร์พีซี throughout.

## Notes

- **Fonts are not included.** FC Minimal and the Material Symbols subset are licensed / build assets and are kept out of this public repo; place the `.woff2` files in `assets/font/` (see `fonts.css`). Without them the page falls back to a system font and icons show as text.
- Figures (81.9%, 17.7%, 80 stations, 12 solar-rooftop stations, revenue bars) come from the original demo.
- The solar-rooftop card uses an existing demo image (city with wind turbines) as a stand-in.
