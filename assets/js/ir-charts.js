/* วิดเจ็ตข้อมูลนักลงทุนในหน้า index-ir — อ่านข้อมูลจาก window.RPC_IR (ir-data.js) และสีจาก token ใน tokens.css */
(() => {
  const D = window.RPC_IR || {};
  /* ค่า token / helper / ตัวสร้างกราฟ อยู่ที่ assets/js/charts.js (สคริปต์กลาง) */
  const { C, FS, FW, R, font, reduce, tok, esc, fmt, al, onView, base, legend, axisX, tip, inLabel, hatch, mount, charts } = window.RPCGCharts;
  /* หน้าภาษาอังกฤษ (index-ir-en.html): ข้อความ/ปี/วันที่สลับตาม <html lang> — ข้อมูลภาษาอังกฤษอยู่ใน ir-data.js (ฟิลด์ *En) */
  const EN = document.documentElement.lang === 'en';
  const L = (th, en) => (EN ? en : th);
  const ce = (y) => (EN ? String(y).replace(/\d{4}/, (m) => String(Number(m) - 543)) : String(y)); /* พ.ศ. → ค.ศ. */
  const loc = L('th-TH-u-ca-buddhist', 'en-GB');
  const hn = (h) => (EN && h.nameEn) || h.name;
  const nt = (n, k) => (EN && n[k + 'En']) || n[k];

  /* นับตัวเลขขึ้น */
  const countUp = (el) => {
    const txt = el.textContent;
    const n = parseFloat(txt.replace(/,/g, ''));
    if (Number.isNaN(n) || reduce) return;
    const dec = (txt.split('.')[1] || '').length;
    const t0 = performance.now(), dur = 1300;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(n * (1 - Math.pow(2, -10 * p)), dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    };
    requestAnimationFrame(step);
  };

  /* ---- เติมข้อมูลลง tile ---- */
  const F = D.finance;
  const YRS = F ? F.years.map(ce) : [];
  const last = F ? F.years.length - 1 : 0;
  const put = (sel, v) => document.querySelectorAll(sel).forEach((el) => { el.textContent = v; });
  /* อัตรากำไรสุทธิ: ใช้ค่าตามตารางงบการเงิน (F.netRate) ถ้ามี ไม่เช่นนั้นคำนวณจาก กำไรสุทธิ ÷ รายได้รวม */
  const periodTh = (y) => { const m = /^(\d+)M\/(\d+)$/.exec(y), q = /^Q(\d)\/(\d+)$/.exec(y); if (EN) return m ? `${m[1]}M/${ce(m[2])}` : q ? `Q${q[1]}/${ce(q[2])}` : `FY${ce(y)}`; return m ? `${m[1]} เดือน/${m[2]}` : q ? `ไตรมาส ${q[1]}/${q[2]}` : `ปี ${y}`; };
  const rate = (a, b) => a.map((v, i) => (v != null && b[i] ? +(v / b[i] * 100).toFixed(1) : null));
  const netRate = F ? (F.netRate || rate(F.net, F.revenue)) : [];
  /* เปรียบเทียบ: งบแสดงฐานะการเงิน = งวดล่าสุด vs งวดก่อน · ผลการดำเนินงาน = ปีเต็มล่าสุด vs ปีก่อน (9M ไม่เทียบกับปีเต็ม) */
  const compare = (series, flow) => {
    const i = flow ? last - 1 : last, j = i - 1;
    return { pct: (series[i] - series[j]) / series[j] * 100, label: `${YRS[i]} ${L('เทียบ', 'vs')} ${YRS[j]}` };
  };

  if (F) {
    Object.entries({ ...F.profile, ...(EN ? { industry: F.profile.industryEn, sector: F.profile.sectorEn, listed: F.profile.listedEn } : {}), grossNote: F.grossNote, netNote: F.netNote, period: YRS[last] }).forEach(([k, v]) => put(`[data-fin="${k}"]`, v));
    [['assets', F.assets, false, 2], ['revenue', F.revenue, true, 2], ['equity', F.equity, false, 2], ['eps', F.eps, true, 2]].forEach(([key, series, flow, dec]) => {
      put(`[data-val="${key}"]`, fmt(series[last], dec));
      /* badge บอกช่วงเวลาของตัวเลข: งบแสดงฐานะการเงิน = ณ งวด · ผลการดำเนินงาน = สะสมในงวด */
      const host = document.querySelector(`[data-chip="${key}"]`);
      if (host) host.innerHTML = `<span class="chip"><i class="icon" aria-hidden="true">calendar_month</i>${flow ? L('สะสม', 'Cumulative') : L('ณ', 'As of')} ${periodTh(F.years[last])}</span>`;
    });
    const gr = rate(F.gross, F.revenue); put('[data-big="gross"]', fmt(gr[gr.map((v) => v != null).lastIndexOf(true)], 1) + '%'); /* งวดล่าสุดที่มีข้อมูลกำไรขั้นต้น */
    put('[data-big="net"]', fmt(netRate[last], 1) + '%');

    /* ข้อสังเกตจากข้อมูล: คำนวณจากชุดข้อมูล แสดงเฉพาะข้อที่เป็นบวก/กลาง ๆ (ไม่แสดงค่าติดลบ) */
    const insHost = document.querySelector('[data-insights]');
    if (insHost) {
      const ins = [];
      const rev = compare(F.revenue, true), ast = compare(F.assets, false);
      if (rev.pct > 0) ins.push(L(`รายได้รวมปี ${YRS[last - 1]} เติบโตจากปี ${YRS[last - 2]}`, `Total revenue for ${YRS[last - 1]} grew from ${YRS[last - 2]}`));
      if (ast.pct > 0) ins.push(L(`สินทรัพย์รวมเพิ่มขึ้นจาก ${YRS[last - 1]}`, `Total assets increased from ${YRS[last - 1]}`));
      [[L('อัตรากำไรขั้นต้น', 'Gross profit margin'), rate(F.gross, F.revenue)], [L('อัตรากำไรสุทธิ', 'Net profit margin'), netRate]].forEach(([name, r]) => {
        if (r[last] === Math.max(...r)) ins.push(L(`${name} ${YRS[last]} สูงที่สุดในช่วงที่แสดง`, `${name} for ${YRS[last]} is the highest in the period shown`));
      });
      ins.push(L(`ส่วนของผู้ถือหุ้นคิดเป็น ${fmt(F.equity[last] / F.assets[last] * 100, 1)}% ของสินทรัพย์รวม`, `Shareholders’ equity is ${fmt(F.equity[last] / F.assets[last] * 100, 1)}% of total assets`));
      insHost.innerHTML = ins.slice(0, 3).map((t) => `<li class="is-up"><i class="icon" aria-hidden="true">check_circle</i>${esc(t)}</li>`).join('');
    }
  }

  const st = D.stock;
  /* เวลาอัปเดตราคาหลักทรัพย์ (หมายเหตุท้ายโซน) */
  if (st && st.asOf) put('[data-foot="asof"]', new Date(st.asOf).toLocaleString(loc, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + L(' น.', ' (GMT+7)'));

  if (D.dividend) {
    const el = document.querySelector('[data-div="latest"]');
    if (el) el.textContent = fmt(D.dividend.perShare[D.dividend.perShare.length - 1], 2);
  }

  /* ---- ผู้ถือหุ้นรายใหญ่ (รายการเรียงอันดับ) ---- */
  const rank = document.querySelector('[data-holders]');
  if (rank && D.holders) {
    const PER = 3; /* แสดงทีละ 3 อันดับ */
    const pages = Math.ceil(D.holders.length / PER);
    const max = Math.max(...D.holders.map((h) => h.pct));
    const pager = document.querySelector('[data-holders-pager]');
    const cnt = pager && pager.querySelector('[data-pager="count"]');
    const prev = pager && pager.querySelector('[data-pager="prev"]');
    const next = pager && pager.querySelector('[data-pager="next"]');
    const asof = document.querySelector('[data-holders-asof]');
    if (asof && D.holdersAsOf) asof.textContent = L('ณ ', 'As of ') + D.holdersAsOf;
    let page = 0, fixedH = 0;
    const draw = () => {
      const from = page * PER;
      rank.innerHTML = D.holders.slice(from, from + PER).map((h, k) => `<li data-r="${from + k + 1}" style="--w:${(h.pct / max * 100).toFixed(1)}%">
        <span class="irp-rank-no" aria-hidden="true">${from + k + 1}</span>
        <div class="irp-rank-body"><b>${esc(hn(h))}</b><small>${fmt(h.shares)} ${L('หุ้น', 'shares')}</small><i class="irp-rank-bar"><u></u></i></div>
        <span class="irp-rank-pct"><b>${fmt(h.pct, 2)}</b>%</span></li>`).join('');
      rank.classList.remove('is-swap'); void rank.offsetWidth; rank.classList.add('is-swap');
      /* บาร์เติมความยาวทันทีหลังเปลี่ยนหน้า */
      requestAnimationFrame(() => rank.closest('.irp-w') && rank.classList.add('in'));
      if (cnt) cnt.textContent = `${page + 1}/${pages}`;
      if (prev) prev.disabled = page === 0;
      if (next) next.disabled = page === pages - 1;
      /* คงความสูงเท่าหน้าเต็ม ไม่ให้การ์ดหดตอนหน้าสุดท้ายมีน้อยกว่า 3 แถว */
      if (!fixedH && D.holders.length > PER) fixedH = rank.offsetHeight;
      if (fixedH) rank.style.minHeight = fixedH + 'px';
    };
    draw();
    if (pager) {
      if (pages < 2) pager.hidden = true;
      prev.addEventListener('click', () => { if (page > 0) { page--; draw(); } });
      next.addEventListener('click', () => { if (page < pages - 1) { page++; draw(); } });
    }
  }

  /* ---- กราฟ (สร้างเมื่อเลื่อนมาถึง เพื่อให้ animation ได้เห็น) ---- */
  const top = (r) => ({ borderRadius: r || [R, R, 0, 0] });

  document.querySelectorAll('[data-spark]').forEach((el) => {
    const series = F && F[el.dataset.spark];
    if (!series) return;
    mount(el, {
      grid: { left: 2, right: 8, top: 8, bottom: 2 }, xAxis: { type: 'category', show: false, boundaryGap: false, data: YRS },
      yAxis: { type: 'value', show: false, min: (v) => v.min - (v.max - v.min) * 0.5 },
      series: [{ type: 'line', smooth: true, data: series.map((v, i) => ({ value: v, symbol: i === last ? 'circle' : 'none', symbolSize: 9 })), lineStyle: { color: C.brand, width: 3 },
        itemStyle: { color: C.brand, borderColor: C.surface, borderWidth: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: al(C.brand, 0.27) }, { offset: 1, color: al(C.brand, 0) }]) } }]
    });
  });
  if (F) {
    const yHidden = { type: 'value', show: false };
    const noGrid = { left: 12, right: 12, top: 28, bottom: 28, containLabel: false };
    const pill = (color, r = R) => ({ color, borderRadius: [r, r, 0, 0] });
    /* งวดล่าสุด (Q2) ไม่เต็มปี → ลายเฉียงจาก charts.js (hatch) เหมือนกราฟทุกหน้า */
    const partialAt = (i, color) => (i === last ? { color: hatch(color) } : {});
    const topLabel = (fmtr) => ({ show: true, position: 'top', color: C.ink, fontFamily: font, fontWeight: FW.semibold, fontSize: FS.xs, formatter: (p) => (p.value == null ? '' : fmtr(p)) });
    /* แท่ง + เส้นอัตรากำไร: แกนขวาเลื่อนให้เส้นลอยอยู่เหนือแท่ง */
    const barLine = (name, data, rate, barColor, lineColor, dec = 0) => ({ baseOption: {
      /* ตัวทำเครื่องหมายหน้าชื่อรายการ: เส้นอัตราใช้สีเขียวของเส้น (ค่าเริ่มต้นของ ECharts ดึงสีขาวจากจุดวงกลมมาใช้ จึงมองไม่เห็น) */
      tooltip: { ...tip, formatter: (ps) => `<div style="margin-bottom:4px">${ps[0].axisValueLabel}</div>` + ps.map((p) => {
        const isLine = p.seriesType === 'line';
        return `<div style="display:flex;align-items:center;gap:6px;white-space:nowrap">${isLine ? `<i style="position:relative;width:16px;height:3px;border-radius:2px;background:${lineColor};display:inline-block"><b style="position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;border:2px solid ${lineColor};box-sizing:border-box"></b></i>` : `<i style="width:10px;height:10px;border-radius:50%;background:${barColor};display:inline-block"></i>`}<span>${p.seriesName}</span><b style="margin-left:auto;padding-left:20px">${isLine ? (p.value == null ? '–' : p.value + '%') : fmt(p.value, dec)}</b></div>`;
      }).join('') },
      grid: noGrid, xAxis: axisX(YRS),
      yAxis: [{ ...yHidden, max: (v) => v.max * (rate ? 2.3 : 1.2) }, { ...yHidden, min: (v) => v.min - (v.max - v.min) * 3.2, max: (v) => v.max + (v.max - v.min) * 0.2 }],
      series: [
        { name, type: 'bar', barWidth: '34%', data: data.map((v, i) => ({ value: v, itemStyle: { borderRadius: v < 0 ? [R, R, 0, 0].reverse() : [R, R, 0, 0], ...partialAt(i, barColor) } })), itemStyle: pill(barColor), label: topLabel((p) => fmt(p.value, dec)) },
        ...(rate ? [{ name: L('อัตรา (%)', 'Rate (%)'), type: 'line', yAxisIndex: 1, data: rate, symbol: 'circle', symbolSize: 8, lineStyle: { color: lineColor, width: 3 }, itemStyle: { color: C.surface, borderColor: lineColor, borderWidth: 2 }, tooltip: { valueFormatter: (v) => v + '%' } }] : [])
      ] },
      /* จอแคบ: ตัวเลขบนแท่งหมุนตั้ง (แบบกราฟสินทรัพย์/หนี้สิน) ไม่ให้ชนกัน + เพิ่มที่ว่างด้านบนให้ตัวเลขตั้ง */
      media: [{ query: { maxWidth: 420 }, option: {
        yAxis: [{ max: (v) => v.max * (rate ? 4.2 : 1.6) }, { min: (v) => v.min - (v.max - v.min) * 5.5, max: (v) => v.max + (v.max - v.min) * 0.15 }], /* มีเส้นอัตรา → ดันแท่งลง เส้นขึ้นบนสุด ไม่ทับตัวเลข */
        series: [{ barWidth: '40%', label: { rotate: 90, align: 'left', verticalAlign: 'middle', distance: 6 } }, ...(rate ? [{ symbolSize: 6, lineStyle: { width: 2 } }] : [])] } }]
    });
    /* กราฟแท่งคู่: ตัวเลขมีทศนิยม (ยาว) → หมุนตั้งขึ้นเหนือแท่งทุกขนาดจอ + ขยายแท่ง ไม่ให้ซ้อนทับกัน */
    const vertLabel = { rotate: 90, align: 'left', verticalAlign: 'middle', distance: 6, fontSize: FS.xs };
    const narrowBars = { query: { maxWidth: 99999 }, option: {
      yAxis: { max: (v) => v.max * 1.5 }, /* เผื่อที่ให้ตัวเลขตั้ง (9,530.25) ไม่ล้นขอบบน */
      series: [
        { barWidth: '24%', barGap: '10%', label: vertLabel },
        { barWidth: '24%', label: vertLabel }
      ] } };
    mount('chAssets', {
      baseOption: {
        tooltip: tip, grid: noGrid, xAxis: axisX(YRS), yAxis: { ...yHidden, max: (v) => v.max * 1.12 },
        series: [
          { name: L('หนี้สินรวม', 'Total liabilities'), type: 'bar', barWidth: '14%', barGap: '24%', data: F.liabilities.map((v, i) => ({ value: v, itemStyle: partialAt(i, C.primary) })), itemStyle: pill(C.primary), label: { ...topLabel((p) => fmt(p.value, 2)), align: 'right' } },
          { name: L('สินทรัพย์รวม', 'Total assets'), type: 'bar', barWidth: '14%', data: F.assets.map((v, i) => ({ value: v, itemStyle: partialAt(i, C.brand) })), itemStyle: pill(C.brand), label: { ...topLabel((p) => fmt(p.value, 2)), align: 'left' } }
        ]
      },
      media: [narrowBars]
    });
    mount('chGross', barLine(L('รายได้รวม', 'Total revenue'), F.revenue, null, C.primary, C.brand, 2));
    mount('chNet', barLine(L('กำไรสุทธิ', 'Net profit'), F.net, netRate, C.primary, C.brand, 2));
  }

  if (D.holders && D.holders.length) {
    const rest = +(100 - D.holders.reduce((a, h) => a + h.pct, 0)).toFixed(2);
    const shades = [C.primary, C.hover, ...[0.7, 0.6, 0.5, 0.4, 0.33, 0.27, 0.22, 0.18].map((a) => al(C.primary, a))];
    const data = [...D.holders, { name: L('ผู้ถือหุ้นรายอื่น', 'Other shareholders'), pct: rest }].map((h, i, all) => ({ name: hn(h), value: h.pct, itemStyle: { color: i === all.length - 1 ? C.line : shades[Math.min(i, shades.length - 1)] } }));
    mount('chHolders', {
      tooltip: { trigger: 'item', formatter: '{b}<br/><b>{c}%</b>', textStyle: { fontFamily: font }, borderWidth: 0 },
      title: { text: fmt(D.holders[0].pct, 2) + '%', subtext: L('ผู้ถือหุ้นอันดับ 1', 'Largest shareholder'), left: 'center', top: 'center', itemGap: 4,
        textStyle: { fontFamily: font, fontSize: FS.stat, fontWeight: FW.semibold, color: C.primary }, subtextStyle: { fontFamily: font, fontSize: FS.sm, color: C.mutedText } },
      series: [{ type: 'pie', radius: ['62%', '86%'], center: ['50%', '50%'], data, label: { show: false }, emphasis: { scaleSize: 6 }, itemStyle: { borderColor: C.surface, borderWidth: 3, borderRadius: 6 } }]
    });
  }

  if (D.dividend) {
    mount('chDividend', {
      tooltip: tip, grid: { left: 8, right: 8, top: 28, bottom: 8, containLabel: true },
      xAxis: axisX(D.dividend.years.map(ce)), yAxis: { type: 'value', show: false, max: (v) => v.max * 1.25 },
      series: [{ type: 'bar', barWidth: '26%', data: D.dividend.perShare, itemStyle: { color: C.primary, ...top() },
        label: { show: true, position: 'top', color: C.ink, fontFamily: font, fontWeight: FW.semibold, formatter: (p) => p.value.toFixed(2) } }]
    });
  }

  /* ตารางข้อมูลของกราฟสำหรับโปรแกรมอ่านหน้าจอ (ซ่อนจากสายตา แต่อยู่ใน DOM ถัดจากกราฟ) */
  const srTable = (chartId, caption, head, rows) => {
    const el = document.getElementById(chartId);
    if (!el) return;
    const t = document.createElement('table');
    t.className = 'visually-hidden';
    t.innerHTML = `<caption>${esc(caption)}</caption><thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    el.after(t);
  };
  if (F) {
    srTable('chAssets', L('สินทรัพย์รวมและหนี้สินรวม รายปี (ล้านบาท)', 'Total assets and total liabilities by year (THB million)'), [L('ปี', 'Year'), L('สินทรัพย์รวม', 'Total assets'), L('หนี้สินรวม', 'Total liabilities')], YRS.map((y, i) => [y, fmt(F.assets[i], 2), fmt(F.liabilities[i], 2)]));
    srTable('chGross', L('รายได้รวม รายปี', 'Total revenue by year'), [L('ปี', 'Year'), L('รายได้รวม (ล้านบาท)', 'Total revenue (THB million)')], YRS.map((y, i) => [y, fmt(F.revenue[i], 2)]));
    srTable('chNet', L('กำไรสุทธิและอัตรากำไรสุทธิ รายปี', 'Net profit and net profit margin by year'), [L('ปี', 'Year'), L('กำไรสุทธิ (ล้านบาท)', 'Net profit (THB million)'), L('อัตรากำไรสุทธิ (%)', 'Net profit margin (%)')], YRS.map((y, i) => [y, fmt(F.net[i], 2), fmt(netRate[i], 1)]));
  }
  if (D.holders && D.holders.length) {
    const rest = +(100 - D.holders.reduce((a, h) => a + h.pct, 0)).toFixed(2);
    srTable('chHolders', L('สัดส่วนการถือหุ้น ณ 2 พ.ค. 2568', 'Shareholding proportion'), [L('ผู้ถือหุ้น', 'Shareholder'), L('จำนวนหุ้น', 'Shares'), L('สัดส่วน (%)', 'Proportion (%)')], [...D.holders.map((h) => [hn(h), fmt(h.shares), fmt(h.pct, 2)]), [L('ผู้ถือหุ้นรายอื่น', 'Other shareholders'), '', fmt(rest, 2)]]);
  }
  if (D.dividend) srTable('chDividend', L('เงินปันผลจ่ายต่อหุ้น รายปี (บาท/หุ้น)', 'Dividend per share by year (THB/share)'), [L('ปี', 'Year'), L('เงินปันผลต่อหุ้น', 'Dividend per share')], D.dividend.years.map((y, i) => [ce(y), fmt(D.dividend.perShare[i], 2)]));

  /* มี ResizeObserver ต่อกราฟแล้ว (ใน mount) — ใช้ window resize เฉพาะเบราว์เซอร์ที่ไม่รองรับ */
  if (!('ResizeObserver' in window)) { let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => charts.forEach((c) => c.resize()), 120); }); }

  /* ---- ข่าวและปฏิทิน ---- */
  const th = (iso, o) => new Date(iso + 'T00:00:00').toLocaleDateString(loc, o);
  /* ข่าวแยกตามแหล่ง: data-news="set" | "company" (ล่าสุด 3 ข่าวต่อแหล่ง) */
  document.querySelectorAll('[data-news]').forEach((host) => {
    host.innerHTML = (D.news || []).filter((n) => n.type === host.dataset.news).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
      .map((n) => `<li class="news-item"><span class="news-ic" aria-hidden="true"><i class="icon">article</i></span><div><h4><a class="news-link" href="${esc(n.href)}">${esc(nt(n, 'title'))}</a></h4><div class="news-meta"><time class="news-date" datetime="${n.date}"><b>${th(n.date, { day: 'numeric' })}</b><span>${th(n.date, { month: 'short', year: 'numeric' })}</span></time></div></div></li>`).join('');
  });

  /* กิจกรรมเดียว: ที่ใกล้ถึงที่สุด (ถ้าไม่มีที่ยังไม่ถึง ใช้ล่าสุดที่ผ่านมา) */
  const ev = document.querySelector('[data-events]');
  if (ev && D.events) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const at = (e) => new Date(e.date + 'T00:00:00');
    const sorted = [...D.events].sort((a, b) => at(a) - at(b));
    const next = sorted.find((e) => at(e) >= today);
    const e = next || sorted[sorted.length - 1];
    if (e) {
      ev.innerHTML = `<li><time class="irp-bigdate" datetime="${e.date}"><b>${th(e.date, { day: 'numeric' })}</b><span>${th(e.date, { month: 'long', year: 'numeric' })}</span></time><div><span class="irp-w-label">${next ? L('กิจกรรมถัดไป', 'Next event') : L('กิจกรรมล่าสุด', 'Latest event')}</span><strong>${esc(nt(e, 'title'))}</strong></div></li>`;
      const box = document.querySelector('[data-next]');
      const days = next ? Math.round((at(next) - today) / 864e5) : null;
      if (next && box) {
        box.hidden = false;
        box.querySelector('[data-next="days"]').textContent = days;
      }
      /* ปุ่มกิจกรรมถัดไปที่แถบด้านบน: ให้เห็นวันสำคัญเร็ว โดยข่าวและปฏิทินเต็มอยู่ด้านล่าง */
      const nb = document.querySelector('[data-nextbtn]');
      if (next && nb) {
        nb.hidden = false;
        nb.querySelector('[data-np="title"]').textContent = nt(next, 'title');
        nb.querySelector('[data-np="days"]').textContent = days;
      }
    }
  }


  /* ทางลัดสไลด์ (สุขภาพหุ้น / เครื่องคำนวณ) ย้ายไป assets/js/ir.js → "Band motion" */

  /* ---- นับตัวเลขเมื่อเข้าจอ ---- */
  document.querySelectorAll('.irp-count').forEach((el) => onView(el, () => countUp(el), 0.5));

  /* ---- ลำดับเข้าจอของ tile + spotlight ตามเมาส์ ---- */
  document.querySelectorAll('.irp-bento > *').forEach((el) => el.classList.add('stagger-item'));
  document.querySelectorAll('.irp-w').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
