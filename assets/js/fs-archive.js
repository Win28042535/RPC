/* คลังงบการเงินย้อนหลัง: 3 รูปแบบสำหรับนำเสนอ (A ปุ่มปี · A2 dropdown · B พับ/กางรายปี)
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
    tog: 'Archive layout', v: { a: ['A', 'Year buttons'], a2: ['A2', 'Dropdown'], b: ['B', 'Expand by year'], c: ['C', 'All years'] }, jump: 'Jump to year'
  } : {
    rows: ['รายงานของผู้สอบบัญชี', 'งบการเงิน', 'หมายเหตุประกอบงบการเงิน'],
    cols: [['ไตรมาส 1', '31 มี.ค.'], ['ไตรมาส 2', '30 มิ.ย.'], ['ไตรมาส 3', '30 ก.ย.'], ['ประจำปี', '31 ธ.ค.']],
    doc: 'เอกสาร', view: 'ดู', dl: 'ดาวน์โหลด', na: 'ยังไม่เผยแพร่', fy: 'ปีงบการเงิน', docs: 'เอกสาร',
    pick: 'เลือกปีงบการเงิน', more: (n, y) => 'แสดงปีก่อนหน้าอีก ' + n + ' ปี (ถึง ' + y + ')', capt: y => 'เอกสารงบการเงินปี ' + y,
    pn: (c, y) => c === 3 ? 'ประจำปี ' + y : 'ไตรมาส ' + (c + 1) + '/' + y,
    tog: 'ตัวอย่างคลังเอกสาร', v: { a: ['A', 'เลือกทีละปี'], a2: ['A2', 'Dropdown'], b: ['B', 'พับ/กางรายปี'], c: ['C', 'กางทุกปี'] }, jump: 'ไปยังปี'
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
      /* กางทุกปี: แถบปีติดบน (กดเลื่อนไปปีนั้น + ไฮไลต์ปีที่กำลังดู) · หัวปีติดบนขณะเลื่อน · วาดตารางเมื่อใกล้ถึง */
      box.innerHTML = '<nav class="fsc-jump" aria-label="' + L.jump + '"><div class="fsc-jump-in">' +
        YEARS.map(y => '<a href="#y' + lab(y) + '" data-y="' + y + '">' + lab(y) + '</a>').join('') + '</div></nav><div class="fsc-list">' +
        YEARS.map(y => '<section class="fsc-year" id="y' + lab(y) + '" data-y="' + y + '" aria-label="' + L.fy + ' ' + lab(y) + '"><div class="fs-year-head fsc-head">' + head(y) + '</div><div class="fsc-body"></div></section>').join('') + '</div>';
      const jump = box.querySelector('.fsc-jump'), jin = jump.firstChild, secs = [...box.querySelectorAll('.fsc-year')];
      const bg = getComputedStyle(document.getElementById('fsLibSec') || document.body).backgroundColor;
      const navH = () => { const n = document.querySelector('.rpcg-nav'); if (!n) return 0; const r = n.getBoundingClientRect(); return Math.max(0, Math.round(r.bottom)); }; /* เมนูซ่อนตัวเมื่อเลื่อนลง: ใช้ขอบล่างจริง */
      const setTops = () => { box.style.setProperty('--fsc-nav', navH() + 'px'); box.style.setProperty('--fsc-jump', jump.offsetHeight + 'px'); box.style.setProperty('--fsc-bg', bg); };
      setTops(); addEventListener('resize', setTops);
      const fill = s => { if (!s._f) { s.querySelector('.fsc-body').innerHTML = table(s.dataset.y); s._f = 1; } };
      if ('IntersectionObserver' in window) {
        const lazy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fill(e.target); lazy.unobserve(e.target); } }), { rootMargin: '1200px 0px' });
        secs.forEach(s => lazy.observe(s));
      } else secs.forEach(fill);
      const mark = y => { jin.querySelectorAll('a').forEach(a => { const on = a.dataset.y === y; a.classList.toggle('is-active', on); if (on) { a.setAttribute('aria-current', 'true'); const l = a.offsetLeft - (jin.clientWidth - a.offsetWidth) / 2; jin.scrollTo({ left: l, behavior: 'smooth' }); } else a.removeAttribute('aria-current'); }); };
      const spy = () => { const line = navH() + jump.offsetHeight + 80; let cur = secs[0];
        for (const s of secs) { if (s.getBoundingClientRect().top <= line) cur = s; else break; } if (cur.dataset.y !== box._cy) { box._cy = cur.dataset.y; mark(cur.dataset.y); } };
      let tick = 0, settle = 0; const onScroll = () => { clearTimeout(settle); settle = setTimeout(() => { if (root.dataset.view === 'c') setTops(); }, 450); if (!tick) { tick = 1; requestAnimationFrame(() => { tick = 0; if (root.dataset.view === 'c') { setTops(); spy(); } }); } };
      addEventListener('scroll', onScroll, { passive: true }); spy();
      const go = (y, smooth) => { const s = secs.find(x => x.dataset.y === y); if (!s) return; secs.slice(0, secs.indexOf(s) + 1).forEach(fill);
        const top = s.getBoundingClientRect().top + scrollY - navH() - jump.offsetHeight + 1; scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' }); };
      jin.addEventListener('click', e => { const a = e.target.closest('[data-y]'); if (!a) return; e.preventDefault(); setHash(a.dataset.y); go(a.dataset.y, !matchMedia('(prefers-reduced-motion: reduce)').matches); });
      const h = hashYear(); if (h && box._ready !== 1) setTimeout(() => go(h, false), 60);
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
  let cur = VIEWS[params.get('v')] ? params.get('v') : 'a2';
  const tog = document.createElement('nav');
  tog.className = 'fsx-tog'; tog.setAttribute('aria-label', L.tog);
  tog.innerHTML = '<span class="fsx-tog-lab">' + L.tog + '</span><div class="fsx-tog-seg">' +
    Object.entries(L.v).map(([k, [s, d]]) => '<a href="?v=' + k + '" data-v="' + k + '"><b>' + s + '</b><span>' + d + '</span></a>').join('') + '</div>';
  document.body.appendChild(tog);
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
