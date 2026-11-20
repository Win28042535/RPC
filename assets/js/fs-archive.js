/* คลังงบการเงินย้อนหลัง: แบบหลัก C (กางทุกปี) + แบบสำรองสำหรับนำเสนอ (A ปุ่มปี · A2 dropdown · B พับ/กางรายปี)
   C กางทุกปี · ข้อมูลจาก fs-archive-data.js · เลือกแบบด้วยแถบลอย หรือ ?v=a|a2|b|c (ค่าเริ่มต้น a2) · ปีที่เลือกอยู่ใน #yYYYY */
(() => {
  const root = document.getElementById('fsLib'); const DATA = window.RPCG_FS_ARCHIVE;
  if (!root || !DATA) return;
  const EN = document.documentElement.lang === 'en';
  const L = EN ? {
    rows: ['Auditor’s report', 'Financial statements', 'Notes to the financial statements'],
    cols: [['Q1', '31 Mar'], ['Q2', '30 Jun'], ['Q3', '30 Sep'], ['Full year', '31 Dec']],
    doc: 'Document', view: 'View', dl: 'Download', na: 'Not yet published', fy: 'Financial year', docs: 'documents',
    pick: 'Select year', more: (n, y) => 'Show ' + n + ' earlier years (to ' + y + ')', capt: y => 'Financial statement documents ' + y,
    pn: (c, y) => c === 3 ? 'full year ' + y : 'Q' + (c + 1) + '/' + y,
    tog: 'Archive layout', v: { a: ['A', 'Year buttons'], a2: ['A2', 'Dropdown'], b: ['B', 'Expand by year'], c: ['C', 'All years'] }, jump: 'Jump to year', prevY: 'Earlier years', nextY: 'Later years'
  } : {
    rows: ['รายงานของผู้สอบบัญชี', 'งบการเงิน', 'หมายเหตุประกอบงบการเงิน'],
    cols: [['ไตรมาส 1', '31 มี.ค.'], ['ไตรมาส 2', '30 มิ.ย.'], ['ไตรมาส 3', '30 ก.ย.'], ['ประจำปี', '31 ธ.ค.']],
    doc: 'เอกสาร', view: 'ดู', dl: 'ดาวน์โหลด', na: 'ยังไม่เผยแพร่', fy: 'ปีงบการเงิน', docs: 'เอกสาร',
    pick: 'เลือกปีงบการเงิน', more: (n, y) => 'แสดงปีก่อนหน้าอีก ' + n + ' ปี (ถึง ' + y + ')', capt: y => 'เอกสารงบการเงินปี ' + y,
    pn: (c, y) => c === 3 ? 'ประจำปี ' + y : 'ไตรมาส ' + (c + 1) + '/' + y,
    tog: 'ตัวอย่างคลังเอกสาร', v: { a: ['A', 'เลือกทีละปี'], a2: ['A2', 'Dropdown'], b: ['B', 'พับ/กางรายปี'], c: ['C', 'กางทุกปี'] }, jump: 'ไปยังปี', prevY: 'เลื่อนไปปีก่อนหน้า', nextY: 'เลื่อนไปปีล่าสุด'
  };
  const SRC = EN ? DATA.en : DATA.th;
  const lab = y => EN ? String(y) : String(+y + 543);           // ปีที่แสดง
  const YEARS = Object.keys(SRC).sort((a, b) => b - a);         // ค.ศ.
  const D = y => SRC[y];
  const cnt = y => D(y).flat().filter(Boolean).length;
  const btn = (u, ic, a, t) => '<a class="button button-secondary button-sm button-icon" href="' + u + '" target="_blank" rel="noopener" aria-label="' + a + '" title="' + t + '"><i class="icon" aria-hidden="true">' + ic + '</i></a>';
  const table = y => { const Y = lab(y);
    return '<div class="data-table-wrap"><table class="data-table fs-matrix"><caption class="visually-hidden">' + L.capt(Y) + '</caption><thead><tr><th scope="col">' + L.doc + '</th>' +
      L.cols.map((c, i) => '<th scope="col" class="fs-col' + (i === 3 ? ' is-fy' : '') + '"><span class="th-stack"><b>' + c[0] + '</b><small>' + c[1] + ' ' + Y + '</small></span></th>').join('') + '</tr></thead><tbody>' +
      D(y).map((r, ri) => '<tr style="--k:' + (ri + 1) + '"><th scope="row"><div class="doc-cell"><span class="doc-ico" aria-hidden="true"><small>PDF</small></span><span class="doc-title"><b>' + L.rows[ri] + '</b></span></div></th>' +
        r.map((u, c) => '<td class="fs-cell' + (u ? '' : ' is-na') + (c === 3 ? ' is-fy' : '') + '" data-col="' + L.cols[c][0] + '">' + (u
          ? '<span class="fs-cell-in">' + btn(u, 'visibility', L.view + ' ' + L.rows[ri] + ' ' + L.pn(c, Y), L.view) + btn(u, 'download', L.dl + ' ' + L.rows[ri] + ' ' + L.pn(c, Y), L.dl) + '</span>'
          : '<span class="fs-na" title="' + L.na + '"><span aria-hidden="true">—</span><span class="visually-hidden">' + L.na + '</span></span>') + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>'; };
  const head = y => '<h3>' + L.fy + ' ' + lab(y) + '</h3><span class="chip">' + cnt(y) + ' ' + L.docs + '</span>';
  const hashYear = () => { const m = location.hash.match(/^#y(\d{4})$/); if (!m) return null; const y = EN ? m[1] : String(+m[1] - 543); return SRC[y] ? y : null; };
  const setHash = y => history.replaceState(null, '', location.pathname + location.search + '#y' + lab(y));

  const VIEWS = {
    a(box) {
      box.innerHTML = '<div class="fsa-bar"><span class="fsa-lab" id="fsaLab">' + L.pick + '</span><div class="tabs tabs-pill fsa-years" role="group" aria-labelledby="fsaLab">' +
        YEARS.map(y => '<button type="button" class="tab" data-y="' + y + '" aria-pressed="false">' + lab(y) + '</button>').join('') + '</div></div><div class="fs-year" aria-live="polite"></div>';
      const bar = box.querySelector('.fsa-years'), out = box.querySelector('.fs-year');
      const show = (y, push) => { bar.querySelectorAll('.tab').forEach(b => { const on = b.dataset.y === y; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
        out.innerHTML = '<div class="fs-year-head">' + head(y) + '</div>' + table(y); if (push) setHash(y); };
      bar.addEventListener('click', e => { const b = e.target.closest('[data-y]'); if (b) show(b.dataset.y, true); });
      show(hashYear() || YEARS[0], false);
    },
    a2(box) {
      box.innerHTML = '<div class="fs-year"><div class="fs-year-head fsd-head"><span class="fsd-title" aria-live="polite"></span><div class="fsd-pick"><label class="visually-hidden" for="fsdSel">' + L.pick + '</label><div class="field-select fsd-sel"><select class="field-input" id="fsdSel">' +
        YEARS.map(y => '<option value="' + y + '">' + lab(y) + '</option>').join('') + '</select></div></div></div><div class="fsd-table"></div></div>';
      const sel = box.querySelector('select');
      const show = (y, push) => { sel.value = y; box.querySelector('.fsd-title').innerHTML = head(y); box.querySelector('.fsd-table').innerHTML = table(y); if (push) setHash(y); };
      sel.addEventListener('change', () => show(sel.value, true));
      show(hashYear() || YEARS[0], false);
    },
    c(box) {
      /* กางทุกปี (แบบหลัก): แถบปีติดบน เลื่อนซ้าย-ขวาได้ (ปุ่ม ‹ › · ลาก · ล้อเมาส์ · ปัด · คีย์บอร์ด) · ไฮไลต์ปีที่กำลังดู
         กดปี → เลื่อนลงให้หัวปีหยุดใต้แถบพอดี · หัวปีติดบนขณะเลื่อน · วาดตารางเมื่อใกล้ถึง */
      const arr = (d, ic, t) => '<button type="button" class="fsc-arr fsc-arr-' + d + '" aria-label="' + t + '" title="' + t + '" tabindex="-1"><i class="icon" aria-hidden="true">' + ic + '</i></button>';
      box.innerHTML = '<nav class="fsc-jump is-start" aria-label="' + L.jump + '">' + arr('prev', 'chevron_left', L.prevY) +
        '<div class="fsc-jump-in">' + YEARS.map(y => '<a href="#y' + lab(y) + '" data-y="' + y + '" draggable="false">' + lab(y) + '</a>').join('') + '</div>' +
        arr('next', 'chevron_right', L.nextY) + '</nav><div class="fsc-list">' +
        YEARS.map(y => '<section class="fsc-year" id="y' + lab(y) + '" data-y="' + y + '" aria-label="' + L.fy + ' ' + lab(y) + '"><div class="fs-year-head fsc-head">' + head(y) + '</div><div class="fsc-body"></div></section>').join('') + '</div>';
      const jump = box.querySelector('.fsc-jump'), jin = jump.querySelector('.fsc-jump-in'), secs = [...box.querySelectorAll('.fsc-year')];
      const links = [...jin.querySelectorAll('a')], prevB = jump.querySelector('.fsc-arr-prev'), nextB = jump.querySelector('.fsc-arr-next');
      const bg = getComputedStyle(document.getElementById('fsLibSec') || document.body).backgroundColor;
      const navH = () => { const n = document.querySelector('.rpcg-nav'); if (!n) return 0; return Math.max(0, Math.round(n.getBoundingClientRect().bottom)); };
      const setTops = () => { box.style.setProperty('--fsc-nav', navH() + 'px'); box.style.setProperty('--fsc-jump', jump.offsetHeight + 'px'); box.style.setProperty('--fsc-bg', bg); };
      setTops(); addEventListener('resize', setTops);

      /* วาดตารางเมื่อใกล้ถึง */
      const fill = s => { if (!s._f) { s.querySelector('.fsc-body').innerHTML = table(s.dataset.y); s._f = 1; } };
      if ('IntersectionObserver' in window) {
        const lazy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fill(e.target); lazy.unobserve(e.target); } }), { rootMargin: '1200px 0px' });
        secs.forEach(s => lazy.observe(s));
      } else secs.forEach(fill);

      /* แถบปี: สถานะปลายแถบ (ขอบจาง + ปุ่มจาง) */
      const edges = () => { const max = jin.scrollWidth - jin.clientWidth - 1, x = jin.scrollLeft;
        jump.classList.toggle('is-start', x <= 1); jump.classList.toggle('is-end', x >= max); jump.classList.toggle('no-scroll', max <= 1);
        prevB.disabled = x <= 1; nextB.disabled = x >= max; };
      jin.addEventListener('scroll', edges, { passive: true }); addEventListener('resize', edges); edges();
      const page = d => jin.scrollBy({ left: d * Math.max(160, jin.clientWidth * 0.6), behavior: 'smooth' });
      prevB.addEventListener('click', () => page(-1)); nextB.addEventListener('click', () => page(1));
      /* ล้อเมาส์แนวตั้งขณะชี้แถบ → เลื่อนแนวนอน (ถึงสุดทางแล้วปล่อยให้หน้าเลื่อนต่อ) */
      jin.addEventListener('wheel', e => { if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || e.ctrlKey) return;
        const max = jin.scrollWidth - jin.clientWidth; if ((e.deltaY < 0 && jin.scrollLeft <= 0) || (e.deltaY > 0 && jin.scrollLeft >= max - 1)) return;
        e.preventDefault(); jin.scrollLeft += e.deltaY; }, { passive: false });
      /* ลากด้วยเมาส์ (ลากแล้วปล่อยไม่นับเป็นการกดปี) */
      let drag = null, moved = false;
      jin.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag = { x: e.clientX, l: jin.scrollLeft }; moved = false; });
      addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x;
        if (!moved && Math.abs(dx) > 5) { moved = true; jump.classList.add('is-drag'); try { jin.setPointerCapture(e.pointerId); } catch (_) {} }
        if (moved) jin.scrollLeft = drag.l - dx; });
      const endDrag = () => { if (!drag) return; drag = null; jump.classList.remove('is-drag'); setTimeout(() => { moved = false; }, 0); };
      addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);

      /* ไฮไลต์ปีที่กำลังดู + เลื่อนให้อยู่กลางแถบ */
      const center = (a, smooth) => { const l = a.offsetLeft - (jin.clientWidth - a.offsetWidth) / 2; jin.scrollTo({ left: l, behavior: smooth ? 'smooth' : 'auto' }); };
      const mark = y => links.forEach(a => { const on = a.dataset.y === y; a.classList.toggle('is-active', on);
        if (on) { a.setAttribute('aria-current', 'true'); if (!drag) center(a, true); } else a.removeAttribute('aria-current'); });
      let lock = 0;
      const spy = () => { if (lock) return; const line = navH() + jump.offsetHeight + 80; let cur = secs[0];
        for (const s of secs) { if (s.getBoundingClientRect().top <= line) cur = s; else break; } if (cur.dataset.y !== box._cy) { box._cy = cur.dataset.y; mark(cur.dataset.y); } };
      let tick = 0, settle = 0; const onScroll = () => { clearTimeout(settle); settle = setTimeout(() => { if (root.dataset.view === 'c') setTops(); }, 450); if (!tick) { tick = 1; requestAnimationFrame(() => { tick = 0; if (root.dataset.view === 'c') { setTops(); spy(); } }); } };
      addEventListener('scroll', onScroll, { passive: true }); spy();

      /* กดปี → เลื่อนให้หัวปีหยุดใต้แถบปีพอดี (คำนวณจากความสูงเมนูตอนเลื่อนแล้ว และแก้ซ้ำเมื่อเลื่อนเสร็จ) */
      const target = s => s.getBoundingClientRect().top + scrollY - navH() - jump.offsetHeight;
      const go = (y, smooth) => { const s = secs.find(x => x.dataset.y === y); if (!s) return;
        secs.slice(0, secs.indexOf(s) + 2).forEach(fill); box._cy = y; mark(y); lock = 1;
        scrollTo({ top: target(s), behavior: smooth ? 'smooth' : 'auto' });
        let last = -1, still = 0; const t0 = performance.now();
        const settleGo = () => { const t = target(s); if (Math.abs(scrollY - last) < 1) still++; else still = 0; last = scrollY;
          if (still >= 4 || performance.now() - t0 > 2500) { setTops(); if (Math.abs(scrollY - target(s)) > 1) scrollTo({ top: target(s), behavior: 'auto' }); lock = 0; return; }
          requestAnimationFrame(settleGo); };
        requestAnimationFrame(settleGo); };
      jin.addEventListener('click', e => { const a = e.target.closest('[data-y]'); if (!a) return; e.preventDefault(); if (moved) return;
        setHash(a.dataset.y); go(a.dataset.y, !matchMedia('(prefers-reduced-motion: reduce)').matches); });
      /* คีย์บอร์ด: ← → ไล่ปี (Enter = ไปยังปี ตามปกติของลิงก์) */
      jin.addEventListener('keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; const i = links.indexOf(document.activeElement); if (i < 0) return;
        e.preventDefault(); const n = links[Math.min(links.length - 1, Math.max(0, i + (e.key === 'ArrowRight' ? 1 : -1)))]; n.focus(); center(n, true); });
      const h = hashYear(); if (h) setTimeout(() => go(h, false), 80);
    },
    b(box) {
      const FIRST = 5, open = hashYear() || YEARS[0], oi = YEARS.indexOf(open);
      box.innerHTML = '<div class="fsb-list">' + YEARS.map((y, i) => '<details class="fsb-year" data-y="' + y + '"' + (y === open ? ' open' : '') + (i >= FIRST && i > oi ? ' hidden' : '') + '><summary>' + head(y) + '<span class="fsb-ico" aria-hidden="true"><i class="icon">expand_more</i></span></summary></details>').join('') + '</div>' +
        (YEARS.length > Math.max(FIRST, oi + 1) ? '<div class="fsb-more"><button type="button" class="button button-secondary"><i class="icon" aria-hidden="true">expand_more</i>' + L.more(YEARS.length - Math.max(FIRST, oi + 1), lab(YEARS[YEARS.length - 1])) + '</button></div>' : '');
      const fill = d => { if (!d._f) { d.insertAdjacentHTML('beforeend', table(d.dataset.y)); d._f = 1; } };
      box.querySelectorAll('details').forEach(d => { if (d.open) fill(d); d.addEventListener('toggle', () => { if (d.open) { fill(d); if (box._ready) setHash(d.dataset.y); } }); });
      setTimeout(() => { box._ready = 1; }, 0);
      const more = box.querySelector('.fsb-more button');
      if (more) more.addEventListener('click', () => { box.querySelectorAll('details[hidden]').forEach(d => { d.hidden = false; }); more.parentElement.remove(); });
    }
  };

  /* แถบสลับรูปแบบ (ลอยด้านล่าง แสดงเมื่ออยู่ในส่วนคลังเอกสาร) */
  const params = new URLSearchParams(location.search);
  /* แบบหลัก = C · แบบ A / A2 / B เก็บไว้ใช้ภายหลัง (เปิดดูได้ด้วย ?v=a|a2|b · แถบสลับเปิดด้วย ?switcher=1) */
  let cur = VIEWS[params.get('v')] ? params.get('v') : 'c';
  const SHOW_SWITCHER = params.has('switcher');
  const tog = document.createElement('nav');
  tog.className = 'fsx-tog'; tog.setAttribute('aria-label', L.tog);
  tog.innerHTML = '<span class="fsx-tog-lab">' + L.tog + '</span><div class="fsx-tog-seg">' +
    Object.entries(L.v).map(([k, [s, d]]) => '<a href="?v=' + k + '" data-v="' + k + '"><b>' + s + '</b><span>' + d + '</span></a>').join('') + '</div>';
  if (SHOW_SWITCHER) document.body.appendChild(tog);
  const render = v => { cur = v; root.dataset.view = v; VIEWS[v](root);
    tog.querySelectorAll('[data-v]').forEach(a => { if (a.dataset.v === v) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); };
  tog.addEventListener('click', e => { const a = e.target.closest('[data-v]'); if (!a) return; e.preventDefault(); if (a.dataset.v === cur) return;
    const u = new URL(location.href); u.searchParams.set('v', a.dataset.v); history.replaceState(null, '', u.pathname + u.search + u.hash); render(a.dataset.v); });
  render(cur);
  /* ยกแถบขึ้นเหนือกล่องแจ้งคุกกี้ขณะที่กล่องแสดงอยู่ */
  const lift = () => { const ck = document.querySelector('.ck'); const on = ck && ck.classList.contains('is-in') && !ck.classList.contains('is-out'); const card = on && ck.querySelector('.ck-card');
    tog.style.bottom = card ? (card.getBoundingClientRect().height + (innerWidth < 768 ? 24 : 40)) + 'px' : ''; };
  new MutationObserver(lift).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] }); addEventListener('resize', lift); lift();
  const sec = document.getElementById('fsLibSec') || root;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(en => tog.classList.toggle('is-on', en.isIntersecting)), { rootMargin: '0px 0px -30% 0px' }).observe(sec);
  else tog.classList.add('is-on');
})();
