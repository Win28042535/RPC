/* charts.js — สคริปต์กลางของกราฟทุกตัวในเว็บ (ECharts) · โหลดหลัง echarts และก่อน ir-charts.js / pages.js
   - ค่าสี / ขนาดตัวอักษร / มุมโค้ง อ่านจาก token ใน tokens.css (ไม่มีตัวเลขสีเขียนเอง)
   - window.RPCGCharts: { C, FS, FW, R, font, reduce, esc, fmt, al, onView, base, axisX, tip, legend, inLabel, hatch, mount, bars, charts }
   - bars(el, cfg) = กราฟแท่งแบบกำหนดข้อมูล (หน้าข้อมูลสำคัญทางการเงิน / เงินปันผล): cfg.values หรือ cfg.series[{name,values,text,cls}]
     cfg.partial = ดัชนีงวดที่ไม่เต็มปี → แท่งลายเฉียง · เปลี่ยนค่าด้วยการเรียก bars() ซ้ำที่ element เดิม (animate ให้)
   อัปเดตหน้าตากราฟ (สี ลาย ฟอนต์ tooltip) ที่ไฟล์นี้ที่เดียว */
(() => {
  const css = getComputedStyle(document.documentElement);
  const tok = (n) => css.getPropertyValue(n).trim();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const font = tok('--font-th');
  const C = {
    primary: tok('--primary'), hover: tok('--primary-hover'), muted: tok('--muted'), mutedText: tok('--muted-2'),
    ink: tok('--ink'), surface: tok('--surface'), line: tok('--line-dark-strong'), brand: tok('--brand'), grid: tok('--line-dark')
  };
  /* ขนาด/น้ำหนักตัวอักษรในกราฟ อ่านจาก token (--fs-*, --fw-*) ให้ตรงกับส่วนอื่นของเว็บ */
  const px = (name) => { const d = document.createElement('span'); d.style.cssText = `position:absolute;visibility:hidden;font-size:var(${name})`; document.body.appendChild(d); const v = parseFloat(getComputedStyle(d).fontSize); d.remove(); return v; };
  const FS = { xs: px('--fs-xs'), sm: px('--fs-sm'), stat: px('--fs-stat') };
  const R = px('--r-sm'); /* มุมโค้งของแท่งกราฟ = 8px ตาม token */
  const FW = { semibold: Number(tok('--fw-semibold')) || 600 };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const al = (c, a) => { try { return echarts.color.modify(c, { alpha: a }); } catch (e) { return c; } };
  const fmt = (n, d = 0) => (n == null ? '–' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));

  /* เรียก fn ครั้งเดียวเมื่อ element เข้าจอ */
  const onView = (el, fn, threshold = 0.25) => {
    if (!('IntersectionObserver' in window)) return fn();
    const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); fn(); } }), { threshold });
    o.observe(el);
  };

  /* ---- ค่าพื้นฐานของทุกกราฟ ---- */
  const charts = [];
  const base = { textStyle: { fontFamily: font, color: C.mutedText }, animation: !reduce, animationDuration: 1100, animationEasing: 'cubicOut' };
  const legend = { bottom: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { fontFamily: font, color: C.ink } };
  const axisX = (data) => ({ type: 'category', data, axisTick: { show: false }, axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.mutedText, fontFamily: font, interval: 0, fontSize: FS.xs } });
  const tip = { trigger: 'axis', axisPointer: { type: 'shadow' }, textStyle: { fontFamily: font }, borderWidth: 0 };
  const inLabel = (color) => ({ show: true, position: 'inside', color, fontFamily: font, fontSize: FS.xs });

  /* งวดไม่เต็มปี → ลายเฉียง: repeating-linear-gradient(135deg, สีแท่ง 0 4px, สีแท่ง 45% ผสมพื้น 4px 8px) วาดเป็น pattern canvas ให้ ECharts */
  const hatchCache = {};
  const hatch = (color) => {
    if (hatchCache[color]) return hatchCache[color];
    const S = 45, cv = document.createElement('canvas'); cv.width = cv.height = S;
    const g = cv.getContext('2d');
    g.fillStyle = C.surface; g.fillRect(0, 0, S, S);
    g.globalAlpha = 0.45; g.fillStyle = color; g.fillRect(0, 0, S, S);
    g.globalAlpha = 1;
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(k * S, 0); g.lineTo(k * S + S / 2, 0); g.lineTo(0, k * S + S / 2); g.lineTo(0, k * S); g.closePath(); g.fill(); }
    return (hatchCache[color] = { image: cv, repeat: 'repeat', scaleX: 0.25, scaleY: 0.25 });
  };

  /* สร้างกราฟเมื่อ element เข้าจอ (ให้เห็น animation) · เรียกซ้ำที่ element เดิม = อัปเดตข้อมูลของกราฟเดิม */
  const mount = (id, option) => {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el || !window.echarts) return;
    el._opt = option;
    if (el._chart) { el._chart.setOption({ ...base, ...option }, true); return; }
    if (el._pending) return;
    el._pending = true;
    onView(el, () => {
      const c = echarts.init(el); c.setOption({ ...base, ...el._opt }); charts.push(c); el._chart = c;
      requestAnimationFrame(() => c.resize()); setTimeout(() => c.resize(), 400);
      if ('ResizeObserver' in window) new ResizeObserver(() => c.resize()).observe(el);
    }, 0.15);
  };
  if (!('ResizeObserver' in window)) { let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => charts.forEach((c) => c.resize()), 150); }); }

  /* ---- กราฟแท่งแบบกำหนดข้อมูล ---- */
  const bars = (el, cfg) => {
    const series = cfg.series || [{ name: cfg.title || '', values: cfg.values, text: cfg.text }];
    const S = series.length, dec = cfg.dec != null ? cfg.dec : Number(el.dataset.dec || 2);
    const last = cfg.labels.length - 1, partial = new Set(cfg.partial || []);
    const narrow = () => el.clientWidth < 520 && cfg.labels.some((l) => / /.test(l)); /* ป้ายมีช่องว่าง + จอแคบ → แยก 2 บรรทัด */
    const vertical = S > 1; /* แท่งคู่ → ตัวเลขตั้งหมุนอ่านจากล่างขึ้นบน ไม่ให้ซ้อนกัน */
    const colorOf = (s) => (s.cls === 's-assets' ? C.brand : C.primary);
    const txt = (s, i) => (s.text ? s.text[i] : fmt(s.values[i], dec));
    const label = (neg) => ({
      show: true, position: neg ? 'bottom' : 'top', color: C.ink, fontFamily: font, fontWeight: FW.semibold, fontSize: FS.xs,
      ...(vertical ? { rotate: 90, align: neg ? 'right' : 'left', verticalAlign: 'middle', distance: 6 } : {})
    });
    const option = {
      tooltip: {
        ...tip, backgroundColor: C.surface, padding: 12,
        formatter: (ps) => `<div style="margin-bottom:6px;color:${C.mutedText};font-weight:${FW.semibold}">${esc(ps[0].axisValueLabel)}</div>` + ps.map((p) => {
          const s = series[p.seriesIndex];
          return `<div style="display:flex;align-items:center;gap:8px;white-space:nowrap"><i style="width:10px;height:10px;border-radius:50%;background:${colorOf(s)};display:inline-block"></i>${esc(s.name || cfg.title || '')}<b style="margin-left:auto;padding-left:16px">${esc(txt(s, p.dataIndex))}</b></div>`;
        }).join('')
      },
      /* จอแคบ (กราฟกว้าง < 520px): ป้ายแกน X แยก 2 บรรทัด ("งบปี" / "2565") ไม่ให้ชนกัน */
      grid: { left: 12, right: 12, top: 24, bottom: narrow() ? 52 : 34, containLabel: false },
      xAxis: {
        ...axisX(cfg.labels), axisLine: { show: false },
        axisLabel: { ...axisX([]).axisLabel, fontWeight: FW.semibold, lineHeight: FS.xs * 1.3, color: (v, i) => (i === last ? C.primary : C.mutedText), formatter: (v) => (narrow() ? String(v).replace(' ', '\n') : v) }
      },
      yAxis: { type: 'value', show: false, min: (v) => (v.min < 0 ? v.min * (vertical ? 1.6 : 1.35) : 0), max: (v) => (v.max > 0 ? v.max * (vertical ? 1.5 : 1.25) : 0) },
      series: series.map((s, si) => ({
        name: s.name || cfg.title || '', type: 'bar', barWidth: vertical ? '24%' : '34%', barGap: '10%',
        itemStyle: { color: colorOf(s) },
        data: s.values.map((v, i) => ({
          value: v,
          itemStyle: { borderRadius: v < 0 ? [0, 0, R, R] : [R, R, 0, 0], ...(partial.has(i) ? { color: hatch(colorOf(s)) } : {}) },
          label: { ...label(v < 0), formatter: () => (v == null ? '' : txt(s, i)) }
        })),
        /* เส้นศูนย์ */
        ...(si === 0 ? { markLine: { silent: true, symbol: 'none', animation: false, label: { show: false }, lineStyle: { color: C.line, type: 'solid', width: 1 }, data: [{ yAxis: 0 }] } } : {})
      }))
    };
    el.setAttribute('aria-label', (cfg.title ? cfg.title + ': ' : '') + cfg.labels.map((l, i) => `${l} ` + series.map((s) => (s.name ? s.name + ' ' : '') + txt(s, i)).join(' / ')).join(', '));
    mount(el, option);
  };

  window.RPCGCharts = { C, FS, FW, R, font, reduce, tok, esc, fmt, al, onView, base, axisX, tip, legend, inLabel, hatch, mount, bars, charts };
})();
