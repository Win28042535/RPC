# RPCG homepage — Direction A / B

Design exploration for the RPCG homepage, based on the "ยุทธศาสตร์การยกระดับดิจิทัลแพลตฟอร์ม RPCG" deck.

| Folder / file | What it is |
|---|---|
| `rpcg-homepage-wireframe.html` | Wireframe, Direction A "เชื่อมโยงธุรกิจ สร้างคุณค่า" |
| `rpcg-homepage-wireframe-B.html` | Wireframe, Direction B "ก้าวไปข้างหน้า" |
| `rpcg-demo-A/` | Demo page restructured to follow Wireframe A |
| `rpcg-demo-B/` | Demo page restructured to follow Wireframe B |
| `rpcg-demo-switcher/` | Panel to switch between A, B and A\|B at desktop / tablet / mobile widths |
| `serve-demo.js` | Static dev server for the switcher |

## Run

```bash
node serve-demo.js
```

Open http://localhost:5170 (also `rpcg-demo-A/serve.js` on 5173 and `rpcg-demo-B/serve.js` on 5174).

## Notes

- **Fonts are not included.** The demos use the licensed font *FC Minimal*; place the `.woff2` files in `rpcg-demo-A/assets/font/` and `rpcg-demo-B/assets/font/` (see `fonts.css` for the expected file names). Without them the pages fall back to a system sans-serif.
- **Simulated data.** Net profit, total assets, dividend, the 2564–2567 revenue trend and the ESG indicators are made-up placeholders for design purposes and are labelled as such on the pages. Total revenue 2568 (฿8,370.69 million) and the 81.9% / 17.7% revenue split come from the original demo.
- The demo pages are working copies of the draft at `design.onlineasset.co.th/demo/ir/rpcg-draft/`; the original is unchanged.
