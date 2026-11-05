/* ==========================================================================
   RPC — Mega-menu behavior (markup อยู่ที่ partials/header.html)
   กดเมนูที่มี data-menu → เปิดแผง แสดง .mm-pane ที่ data-mm ตรงกัน
   ========================================================================== */
(() => {
  const panel = document.getElementById('siteMenu');
  const veil = document.getElementById('siteMenuVeil');
  const closeBtn = document.getElementById('siteMenuClose');
  if (!panel || !closeBtn) return;
  const triggers = [...document.querySelectorAll('.rpcg-nav [data-menu]')];
  const panes = [...panel.querySelectorAll('.mm-pane')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SIDE_RAIL_DEFAULT = 'ir';

  let current = null;
  let closedByPointer = false;
  let pinned = false; /* เปิดด้วยการคลิก → ค้างไว้จนกว่าจะคลิกซ้ำ / ปุ่มปิด / Esc / คลิกนอกเมนู (hover ไม่ปิดให้) */
  let lastTrigger = null;

  const open = (key, trigger, viaPointer) => {
    panes.forEach((p) => { p.hidden = p.dataset.mm !== key; });
    current = key;
    lastTrigger = trigger || lastTrigger;
    triggers.forEach((t) => t.setAttribute('aria-expanded', String(t.dataset.menu === key)));
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (veil) veil.classList.add('is-open');
    document.body.classList.add('ir-oc-open');
    /* เมนูอื่น (Bootstrap dropdown เช่น เกี่ยวกับเรา) ที่เปิดค้างอยู่ → ปิด ไม่ให้เปิดซ้อนกับเมกะเมนู */
    if (window.bootstrap) document.querySelectorAll('.rpcg-nav [data-bs-toggle="dropdown"].show').forEach((t) => bootstrap.Dropdown.getInstance(t)?.hide());
    const mobile = document.querySelector('.navbar-collapse.show');
    if (mobile && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(mobile).hide();
    if (!viaPointer) setTimeout(() => closeBtn.focus(), reduceMotion ? 0 : 350);
  };
  const close = () => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (veil) veil.classList.remove('is-open');
    document.body.classList.remove('ir-oc-open');
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    current = null;
    pinned = false;
    if (lastTrigger && !closedByPointer) lastTrigger.focus();
    closedByPointer = false;
  };

  /* stopPropagation — กัน click ไหลไปชน handler ลิงก์ #hash ระดับ document */
  triggers.forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    clearTimeout(openT); clearTimeout(closeT);
    if (current === t.dataset.menu && pinned) close();            /* ปักหมุดไว้แล้ว → คลิกซ้ำคือปิด */
    else { if (current !== t.dataset.menu) open(t.dataset.menu, t); pinned = true; } /* hover เปิดอยู่ก่อน → คลิกคือปักหมุด ไม่ใช่ปิด */
  }));
  closeBtn.addEventListener('click', close);
  if (veil) veil.addEventListener('click', close);
  panel.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) close(); });

  /* แท็บกลุ่มย่อย (master-detail): คลิก / โฟกัส / ชี้เมาส์ค้าง (hover-intent) / ลูกศรขึ้น-ลง */
  const desktop = () => window.matchMedia('(min-width:992px)').matches;
  panes.forEach((pane) => {
    const tabs = [...pane.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      pane.querySelectorAll('[role="tabpanel"]').forEach((p) => p.classList.toggle('is-active', p.dataset.mmPanel === tab.dataset.mmTab));
      if (focus) tab.focus();
    };
    /* เปิดแท็บของหมวดที่มีหน้าปัจจุบัน (ลิงก์ .is-current ใส่จาก tools/build.py) */
    const curPanel = pane.querySelector('[role="tabpanel"] .is-current');
    if (curPanel) {
      const id = curPanel.closest('[role="tabpanel"]').dataset.mmPanel;
      const t0 = tabs.find((t) => t.dataset.mmTab === id);
      if (t0) select(t0);
      if (t0) t0.classList.add('has-current');
    }
    let intent = null;
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || !desktop()) return;
        clearTimeout(intent);
        intent = setTimeout(() => select(tab), 90);
      });
      tab.addEventListener('pointerleave', () => clearTimeout(intent));
      tab.addEventListener('keydown', (e) => {
        const move = { ArrowDown: 1, ArrowUp: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
        if (move === undefined) {
          if (e.key === 'ArrowRight') { const first = pane.querySelector('[role="tabpanel"].is-active a'); if (first) { e.preventDefault(); first.focus(); } }
          return;
        }
        e.preventDefault();
        select(tabs[(i + move + tabs.length) % tabs.length], true);
      });
    });
    /* ลิงก์ในแผง: ArrowLeft กลับไปที่แท็บ */
    pane.querySelectorAll('[role="tabpanel"]').forEach((p) => p.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); tabs.find((t) => t.classList.contains('is-active')).focus(); }
    }));
  });

  /* hover-intent เปิด/ปิด mega-menu บนเดสก์ท็อป (เมาส์เท่านั้น — จอสัมผัสใช้การแตะ) */
  let openT = null, closeT = null;
  const cancelClose = () => clearTimeout(closeT);
  const scheduleClose = () => { if (pinned) return; clearTimeout(closeT); closeT = setTimeout(() => { if (current && desktop()) { closedByPointer = true; close(); } }, 280); };
  triggers.forEach((t) => {
    t.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !desktop()) return;
      cancelClose(); clearTimeout(openT);
      openT = setTimeout(() => { if (current !== t.dataset.menu) open(t.dataset.menu, t, true); }, 140);
    });
    t.addEventListener('pointerleave', (e) => { clearTimeout(openT); if (e.pointerType === 'mouse') scheduleClose(); });
  });
  panel.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') cancelClose(); });
  panel.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') scheduleClose(); });

  const rail = document.getElementById('sideMenuTab');
  if (rail) { rail.setAttribute('aria-controls', 'siteMenu'); rail.addEventListener('click', () => open(SIDE_RAIL_DEFAULT, rail)); }

  /* เปิด dropdown ปกติ (เกี่ยวกับเรา ฯลฯ) → ปิดเมกะเมนูที่ค้างอยู่ ไม่ให้เปิดทั้งสองพร้อมกัน */
  document.addEventListener('show.bs.dropdown', () => { if (current) { clearTimeout(openT); clearTimeout(closeT); closedByPointer = true; close(); } });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) close(); });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...panel.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();

/* language switch (ปุ่มเดียว): ปุ่มแสดงภาษาที่จะสลับไป · จำภาษาที่เลือก + ตั้ง <html lang>
   หน้าที่มีฉบับอีกภาษา ประกาศด้วย <link rel="alternate" hreflang="en|th" href="…"> → กดแล้วไปหน้านั้น
   หน้าที่ยังไม่มีฉบับอีกภาษา → จำค่าไว้อย่างเดียว (เหมือนเดิม) */
(function () {
  const btns = [...document.querySelectorAll('[data-lang-toggle]')];
  if (!btns.length) return;
  const alt = (l) => document.querySelector(`link[rel="alternate"][hreflang="${l}"]`);
  const hasAlt = !!(alt('en') || alt('th'));
  let lang = 'th';
  if (hasAlt) lang = document.documentElement.lang === 'en' ? 'en' : 'th';
  else try { lang = localStorage.getItem('rpcg-lang') || 'th'; } catch (e) {}
  btns.forEach((btn) => btn.addEventListener('click', (e) => {
    const next = lang === 'th' ? 'en' : 'th';
    const link = alt(next);
    if (!link) return;
    e.stopImmediatePropagation();
    try { localStorage.setItem('rpcg-lang', next); } catch (err) {}
    window.location.href = link.href;
  }));
  const apply = (l) => {
    document.documentElement.lang = l;
    const next = l === 'th' ? 'en' : 'th';
    btns.forEach((btn) => {
      btn.textContent = next.toUpperCase();
      btn.lang = next;
      btn.setAttribute('aria-label', next === 'en' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย');
    });
  };
  btns.forEach((btn) => btn.addEventListener('click', () => {
    lang = lang === 'th' ? 'en' : 'th';
    try { localStorage.setItem('rpcg-lang', lang); } catch (e) {}
    apply(lang);
  }));
  apply(lang);
})();

/* dropdown เปิดด้วย hover (CSS) + คลิก (Bootstrap) → เมื่อ hover เมนูอื่น ให้ปิดเมนูที่เปิดค้างด้วยการคลิก ไม่ให้ซ้อนกัน */
(function () {
  if (!window.bootstrap) return;
  document.querySelectorAll('.rpcg-nav .dropdown').forEach((dd) => {
    dd.addEventListener('mouseenter', () => {
      document.querySelectorAll('.rpcg-nav .dropdown.show').forEach((o) => {
        if (o === dd) return;
        const t = o.querySelector('[data-bs-toggle="dropdown"]');
        if (t) bootstrap.Dropdown.getInstance(t)?.hide();
      });
    });
  });
})();
