/* pages.js — พฤติกรรมเฉพาะหน้าย่อย (about-*.html)
   - ไทม์ไลน์: สไลด์ทีละปี คลิก/ลูกศร/คีย์บอร์ด และบนเดสก์ท็อปตรึงหน้าจอแล้วเลื่อนเพื่อเปลี่ยนปี (GSAP ScrollTrigger)
   - ตัวเลขสำคัญนับขึ้นเมื่อเลื่อนมาถึง + spotlight ตามเมาส์
   - พารัลแลกซ์รูป hero (ทุกการเคลื่อนไหวปิดเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const isEn = document.documentElement.lang === 'en';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- ไทม์ไลน์ ---------- */
  const stage = document.getElementById('tlStage');
  const section = document.getElementById('timeline');
  if (stage && section) {
    const tabs = [...stage.querySelectorAll('.tl-tab')];
    const slides = [...stage.querySelectorAll('.tl-slide')];
    const steps = [...stage.querySelectorAll('.tl-step')];
    const tabsBox = stage.querySelector('.tl-tabs');
    const track = tabsBox.querySelector('.tl-track');
    const num = document.getElementById('tlNum');
    const N = tabs.length;
    const total = document.getElementById('tlTotal');
    if (total) total.textContent = '/ ' + String(N).padStart(2, '0');
    const years = tabs.map((t) => Number(t.dataset.year));
    tabsBox.parentElement.style.setProperty('--n', String(N));
    /* ระยะห่างระหว่างปี (เช่น +18 ปี) วางบนเส้นเวลาระหว่างโหนด */
    for (let k = 0; k < N - 1; k++) {
      const g = document.createElement('span');
      g.className = 'tl-gap'; g.setAttribute('aria-hidden', 'true');
      g.style.left = `calc(${(k + 1) * 100}% / ${N})`;
      g.textContent = '+' + (years[k + 1] - years[k]) + (isEn ? ' yr' : ' ปี');
      track.appendChild(g);
    }
    const mark = document.createElement('span');
    mark.className = 'tl-mark'; mark.setAttribute('aria-hidden', 'true');
    track.appendChild(mark);
    const setP = (v) => stage.querySelector('.tl-index').style.setProperty('--p', String(v));
    let cur = Math.max(0, tabs.findIndex((t) => t.classList.contains('is-active')));
    let pin = null; /* ScrollTrigger เมื่อเปิดโหมดตรึง */

    /* แยกตัวเลขปีเป็นรายหลัก เพื่อให้หมุนขึ้นทีละหลัก (เข้าถึงได้ผ่าน aria-label) */
    slides.forEach((s) => {
      const big = s.querySelector('.tl-big');
      if (big) {
        const y = big.textContent.trim();
        big.setAttribute('aria-label', y);
        big.innerHTML = [...y].map((c, i) => `<span class="d" aria-hidden="true" style="--di:${i}"><i>${c}</i></span>`).join('');
      }
      s.querySelectorAll('.tl-ev').forEach((li, k) => li.style.setProperty('--k', k));
    });

    /* เนื้อหายาวเกินกรอบ: เฟดขาวขอบที่ยังมีข้อความถูกตัด + ปุ่ม "อ่านต่อ" เลื่อนลงทีละช่วง */
    const evLists = slides.map((s) => s.querySelector('.tl-evs')).filter(Boolean);
    evLists.forEach((el) => {
      const wrap = document.createElement('div');
      wrap.className = 'tl-evs-wrap';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'tl-more';
      btn.innerHTML = (isEn ? 'Read more' : 'อ่านต่อ') + ' <i class="icon" aria-hidden="true">expand_more</i>';
      btn.addEventListener('click', () => el.scrollBy({ top: Math.round(el.clientHeight * 0.75), behavior: reduce ? 'auto' : 'smooth' }));
      wrap.appendChild(btn);
      el._wrap = wrap;
    });
    const setFade = (el) => {
      const more = el.scrollHeight - el.clientHeight > 2;
      const bottom = more && el.scrollTop + el.clientHeight < el.scrollHeight - 2;
      el.classList.toggle('fade-top', more && el.scrollTop > 2);
      el.classList.toggle('fade-bottom', bottom);
      if (el._wrap) el._wrap.classList.toggle('has-more', bottom);
    };
    evLists.forEach((el) => el.addEventListener('scroll', () => setFade(el), { passive: true }));
    const updateFades = () => evLists.forEach(setFade);
    window.addEventListener('resize', updateFades);
    window.addEventListener('load', updateFades);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateFades);
    updateFades();

    const show = (i, focus) => {
      const prev = cur;
      cur = Math.max(0, Math.min(N - 1, i));
      stage.dataset.dir = cur < prev ? '-1' : '1';
      if (cur !== prev) {
        section.classList.add('is-used');
        if (num) { num.textContent = String(cur + 1).padStart(2, '0'); num.classList.remove('is-tick'); void num.offsetWidth; num.classList.add('is-tick'); }
      }
      tabs.forEach((t, k) => {
        const on = k === cur;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-past', k < cur);
      });
      slides.forEach((s, k) => {
        const on = k === cur;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      });
      steps.forEach((b) => { b.disabled = (b.dataset.step === '-1' && cur === 0) || (b.dataset.step === '1' && cur === N - 1); });
      setP(N > 1 ? cur / (N - 1) : 0);
      if (focus) tabs[cur].focus({ preventScroll: true });
      if (tabsBox.scrollWidth > tabsBox.clientWidth) tabsBox.scrollTo({ left: tabs[cur].offsetLeft - (tabsBox.clientWidth - tabs[cur].offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
    };

    /* ไปยังปีที่ i: โหมดตรึง → เลื่อนหน้าไปยังตำแหน่งของปีนั้น · ปกติ → สลับสไลด์ทันที */
    const go = (i, focus) => {
      const k = Math.max(0, Math.min(N - 1, i));
      if (pin && pin.isActive !== undefined && window.matchMedia('(min-width:992px)').matches) {
        const y = pin.start + ((k + 0.5) / N) * (pin.end - pin.start);
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        if (focus) tabs[k].focus({ preventScroll: true });
      } else show(k, focus);
    };

    tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
    steps.forEach((b) => b.addEventListener('click', () => go(cur + Number(b.dataset.step))));
    stage.addEventListener('keydown', (e) => {
      const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (next) { e.preventDefault(); go(cur + next, true); }
      else if (e.key === 'Home') { e.preventDefault(); go(0, true); }
      else if (e.key === 'End') { e.preventDefault(); go(N - 1, true); }
    });
    const flagScroll = () => tabsBox.classList.toggle('is-scroll', tabsBox.scrollWidth > tabsBox.clientWidth + 1);
    flagScroll();
    window.addEventListener('resize', flagScroll);
    show(cur);

    /* ปัดซ้าย/ขวาบนจอสัมผัสเพื่อเปลี่ยนปี */
    let sx = 0, sy = 0;
    const slidesBox = stage.querySelector('.tl-slides');
    slidesBox.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    slidesBox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* เดสก์ท็อป: ตรึงส่วนไทม์ไลน์ไว้ ระยะเลื่อน ≈ 70% ของความสูงจอ ต่อ 1 ปี → เลื่อนเปลี่ยนปีตามจังหวะการอ่าน */
    if (hasGsap && !reduce) {
      gsap.matchMedia().add('(min-width: 992px)', () => {
        pin = ScrollTrigger.create({
          trigger: section, start: 'top top', end: () => '+=' + Math.round(window.innerHeight * 0.7 * N),
          pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { const k = Math.min(N - 1, Math.floor(self.progress * N)); if (k !== cur) show(k); setP(Math.max(0, Math.min(1, (self.progress * N - 0.5) / (N - 1)))); }
        });
        return () => { if (pin) pin.kill(); pin = null; };
      });
    }

  }

  /* ---------- timeline: แสงตามเมาส์ (เฉพาะเมาส์จริง) ---------- */
  if (section && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let raf = 0;
    section.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = section.getBoundingClientRect();
        section.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        section.style.setProperty('--my', (e.clientY - r.top) + 'px');
        section.classList.add('is-lit');
      });
    });
    section.addEventListener('pointerleave', () => section.classList.remove('is-lit'));
  }

  /* ---------- ตัวเลขสำคัญ: นับขึ้น ---------- */
  const counters = [...document.querySelectorAll('[data-count]')];
  if (counters.length) {
    const run = (el) => {
      const to = Number(el.dataset.count);
      if (reduce || !Number.isFinite(to)) { el.textContent = String(to); return; }
      el.textContent = '0';
      const t0 = performance.now(), dur = 1400;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick); else el.textContent = String(to);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.6 });
      counters.forEach((c) => io.observe(c));
    }
  }

  /* ---------- spotlight ตามเมาส์บนการ์ดตัวเลข (ตั้งตัวแปร CSS ไม่ผ่าน state) ---------- */
  document.querySelectorAll('.fact-row').forEach((c) => c.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---------- scroll helper: เรียก fn ทุกครั้งที่เลื่อน/ปรับขนาด (รวมเป็น 1 ครั้งต่อเฟรม) ---------- */
  const onFrame = (fn) => {
    let t = 0;
    const q = () => { if (!t) t = requestAnimationFrame(() => { t = 0; fn(); }); };
    window.addEventListener('scroll', q, { passive: true });
    window.addEventListener('resize', q);
    q();
  };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  /* ---------- คณะกรรมการ: กรองตามคณะกรรมการชุดย่อย (data-groups) ---------- */
  document.querySelectorAll('[data-bd-filter]').forEach((bar) => {
    const grid = document.getElementById(bar.dataset.bdFilter);
    if (!grid) return;
    const tabs = [...bar.querySelectorAll('[data-group]')];
    const cards = [...grid.querySelectorAll('.bd-card')];
    const live = document.getElementById(bar.dataset.bdLive || '');
    const pick = (btn) => {
      const g = btn.dataset.group;
      tabs.forEach((t) => { const on = t === btn; t.classList.toggle('is-active', on); t.setAttribute('aria-pressed', String(on)); });
      let k = 0;
      cards.forEach((c) => {
        const show = g === 'all' || (c.dataset.groups || '').split(' ').includes(g);
        c.hidden = !show;
        c.classList.remove('is-in');
        if (show && !reduce) { c.style.setProperty('--k', k++); void c.offsetWidth; c.classList.add('is-in'); }
      });
      if (live) live.textContent = String(cards.filter((c) => !c.hidden).length).padStart(2, '0');
    };
    tabs.forEach((t) => t.addEventListener('click', () => pick(t)));
  });

  /* ---------- ข้อความคำต่อคำ: แยกคำ (ตามช่องว่าง) แล้วค่อย ๆ เข้มขึ้นตามการเลื่อน ---------- */
  document.querySelectorAll('[data-words]').forEach((el) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
    const words = [...el.querySelectorAll('.w')];
    if (reduce) { words.forEach((w) => w.classList.add('is-on')); return; }
    onFrame(() => {
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const p = clamp01((vh * 0.85 - r.top) / (vh * 0.85 - vh * 0.3 + r.height * 0.3));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-on', i < n));
    });
  });

  /* ---------- สารจากประธาน: เส้นความคืบหน้าการอ่าน ---------- */
  const letter = document.querySelector('.cs-letter');
  if (letter) onFrame(() => {
    const r = letter.getBoundingClientRect(), vh = window.innerHeight;
    letter.style.setProperty('--p', clamp01((vh * 0.6 - r.top) / r.height).toFixed(4));
  });

  /* ---------- ข้อมูลบริษัท: เส้นแบ่งวาดเข้า (spotlight ของ .fact-row ใช้ตัวเดิมด้านบน) ---------- */
  document.querySelectorAll('.ci-sheet').forEach((sheet) => {
    [...sheet.children].forEach((row, k) => row.style.setProperty('--k', k));
    if (reduce || !('IntersectionObserver' in window)) { sheet.classList.add('in'); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { sheet.classList.add('in'); io.disconnect(); } }), { threshold: 0.15 });
    io.observe(sheet);
  });

  /* ---------- นโยบาย: สารบัญติดข้าง (scrollspy) + เส้นความคืบหน้าแนวตั้ง ----------
     ปลายเส้นวิ่งลงตามหัวข้อที่อ่านอยู่ (ตำแหน่งในสารบัญ + สัดส่วนที่อ่านไปในหัวข้อนั้น) */
  const toc = document.querySelector('.lg-toc');
  if (toc) {
    const links = [...toc.querySelectorAll('a[href^="#"]')];
    const secs = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
    const rail = toc.querySelector('.lg-rail');
    const doc = document.querySelector('.lg-doc');
    let picked = null;
    links.forEach((a, i) => a.addEventListener('click', () => { picked = i; }));
    ['wheel', 'touchmove', 'keydown'].forEach((t) => window.addEventListener(t, () => { picked = null; }, { passive: true }));
    onFrame(() => {
      /* เส้นอ่านอยู่ที่ 30% ของจอ แล้วค่อย ๆ เลื่อนลงไปที่ขอบล่างเมื่อใกล้ท้ายหน้า → หัวข้อท้ายที่สั้นก็ได้เป็น active ตามลำดับ (ไม่ข้าม ไม่กระโดด) */
      const vh = window.innerHeight, remain = document.documentElement.scrollHeight - (window.scrollY + vh);
      const line = vh * (0.3 + 0.7 * (1 - clamp01(remain / (vh * 0.7))));
      let cur = -1;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) cur = i; });
      /* คลิกสารบัญ: หัวข้อที่คลิกเป็น active ทันที (หัวข้อท้ายหน้าเลื่อนไปชนขอบล่างจนไม่ถึงเส้นอ่าน) จนกว่าผู้ใช้จะเลื่อนเอง */
      if (picked != null) cur = picked;
      links.forEach((a, i) => {
        const on = i === Math.max(cur, 0);
        a.classList.toggle('is-active', on);
        a.classList.toggle('is-past', i < cur);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (!rail) return;
      let y = 0;
      if (cur >= 0) {
        const r = secs[cur].getBoundingClientRect();
        const end = secs[cur + 1] ? secs[cur + 1].getBoundingClientRect().top : doc.getBoundingClientRect().bottom;
        const f = clamp01((line - r.top) / Math.max(1, end - r.top));
        const a = links[cur];
        y = a.offsetTop + a.offsetHeight * (0.2 + 0.6 * f); /* เครื่องหมายอยู่ในแถวของหัวข้อที่ active เสมอ */
      }
      rail.style.setProperty('--p', clamp01(y / Math.max(1, rail.offsetHeight)).toFixed(4));
    });
  }
  /* สารบัญแบบพับ (มือถือ): ปิดเมื่อเลือกหัวข้อ */
  document.querySelectorAll('.lg-toc-m a').forEach((a) => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));

  /* ---------- tab ทั่วไป ([data-tabs]): สลับ panel + ปุ่มลูกศรซ้าย/ขวา ---------- */
  document.querySelectorAll('[data-tabs]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        const p = document.getElementById(x.getAttribute('aria-controls'));
        if (p) { p.classList.toggle('is-active', on); p.hidden = !on; }
      });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ---------- hero: รูปเคลื่อนช้ากว่าหน้า (ลึกเข้าไปด้านหลัง) ---------- */
  const heroImg = document.querySelector('.page-hero-media');
  if (hasGsap && !reduce && heroImg) {
    gsap.matchMedia().add('(min-width: 768px)', () => {
      gsap.to(heroImg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
  }
})();

/* ==========================================================================
   หน้านักลงทุนสัมพันธ์ / การกำกับดูแลกิจการ — ตัวกรองปี · ค้นหา · กราฟแท่ง · ฟอร์ม · แนบไฟล์ · แชร์
   ทุกส่วนทำงานจาก data-attribute จึงเปิดหน้าโดยไม่มี JS ก็ยังเห็นข้อมูลครบ
   ========================================================================== */
(() => {
  const EN = document.documentElement.lang === 'en';
  const T = (th, en) => (EN ? en : th);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const pop = (els) => { if (reduce) return; els.forEach((el, k) => { el.classList.remove('is-pop'); el.style.setProperty('--k', Math.min(k, 12)); void el.offsetWidth; el.classList.add('is-pop'); }); };
  const toast = (msg) => {
    const t = document.getElementById('rpcgToast');
    if (!t) return;
    const ic = t.querySelector('.icon');
    t.textContent = ' ' + msg;
    if (ic) t.prepend(ic);
    t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200);
  };

  /* ---------- ตัวกรอง (ปี / หมวด) + ค้นหา ----------
     <div data-filter="listId" data-key="year">  ปุ่ม [data-value] ("all" = ทั้งหมด)
     <input data-search="listId">                 ค้นหาจากข้อความของรายการ
     รายการ = [data-item] ใน #listId  (กลุ่ม [data-group] ซ่อนเองเมื่อไม่มีรายการเหลือ)
     ตัวนับ [data-count-of="listId"] · สถานะว่าง [data-empty-of="listId"]                     */
  const lists = new Map();
  const state = (id) => {
    if (!lists.has(id)) lists.set(id, { filters: {}, q: '' });
    return lists.get(id);
  };
  const apply = (id, animate) => {
    const root = document.getElementById(id);
    if (!root) return;
    const st = state(id);
    const items = [...root.querySelectorAll('[data-item]')];
    const shown = [];
    items.forEach((it) => {
      let ok = Object.entries(st.filters).every(([k, v]) => v === 'all' || (it.dataset[k] || '').split(' ').includes(v));
      if (ok && st.q) ok = norm(it.dataset.text || it.textContent).includes(st.q);
      it.hidden = !ok;
      if (ok) shown.push(it);
    });
    root.querySelectorAll('[data-group]').forEach((g) => {
      const key = g.dataset.group;
      const has = items.some((it) => !it.hidden && it.dataset.inGroup === key);
      g.hidden = !has;
    });
    document.querySelectorAll(`[data-count-of="${id}"]`).forEach((c) => { c.textContent = String(shown.length); });
    document.querySelectorAll(`[data-empty-of="${id}"]`).forEach((e) => { e.hidden = shown.length > 0; });
    /* ไฮไลต์คำค้น (FAQ) */
    root.querySelectorAll('[data-hl]').forEach((el) => {
      if (!el._raw) el._raw = el.innerHTML;
      if (!st.q) { el.innerHTML = el._raw; return; }
      const re = new RegExp('(' + st.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      el.innerHTML = el._raw.replace(/>([^<]+)</g, (m, s) => '>' + s.replace(re, '<mark class="fq-hit">$1</mark>') + '<').replace(/^([^<]+)/, (m) => m.replace(re, '<mark class="fq-hit">$1</mark>'));
    });
    if (animate) pop(shown.filter((el) => !el.matches('tr')));
    /* แจ้งผู้ใช้โปรแกรมอ่านหน้าจอ */
    const live = document.querySelector(`[data-live-of="${id}"]`);
    if (live) live.textContent = T(`แสดง ${shown.length} รายการ`, `Showing ${shown.length} items`);
  };
  document.querySelectorAll('select[data-filter]').forEach((sel) => {
    const id = sel.dataset.filter, key = sel.dataset.key || 'year';
    const pick = (animate) => { state(id).filters[key] = sel.value; apply(id, animate); };
    sel.addEventListener('change', () => pick(true));
    pick(false);
  });
  document.querySelectorAll('[data-filter]:not(select)').forEach((bar) => {
    const id = bar.dataset.filter, key = bar.dataset.key || 'year';
    const btns = [...bar.querySelectorAll('[data-value]')];
    const pick = (b, animate) => {
      btns.forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      state(id).filters[key] = b.dataset.value;
      apply(id, animate);
    };
    btns.forEach((b) => b.addEventListener('click', () => pick(b, true)));
    const init = btns.find((b) => b.classList.contains('is-active')) || btns[0];
    if (init) pick(init, false);
  });
  document.querySelectorAll('[data-search]').forEach((inp) => {
    const id = inp.dataset.search;
    let h = 0;
    inp.addEventListener('input', () => { clearTimeout(h); h = setTimeout(() => { state(id).q = norm(inp.value); apply(id, false); }, 120); });
  });
  /* ปุ่มล้างคำค้น/ตัวกรองในสถานะว่าง */
  document.querySelectorAll('[data-reset]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.reset;
    document.querySelectorAll(`[data-search="${id}"]`).forEach((i) => { i.value = ''; });
    state(id).q = '';
    document.querySelectorAll(`[data-filter="${id}"] [data-value="all"]`).forEach((x) => x.click());
    document.querySelectorAll(`select[data-filter="${id}"]`).forEach((s) => { s.value = 'all'; s.dispatchEvent(new Event('change')); });
    apply(id, true);
  }));

  /* ---------- กราฟแท่ง: <div class="bars" data-bars='{"labels":[…],"values":[…],"partial":[i]}' data-dec="2"> ----------
     วาดด้วย ECharts ผ่านสคริปต์กลาง assets/js/charts.js (RPCCharts.bars) เหมือนกราฟทุกตัวในเว็บ — หน้าต้องโหลด echarts + charts.js ก่อน pages.js */
  const drawBars = (el, cfg) => { if (window.RPCCharts) window.RPCCharts.bars(el, cfg); };
  document.querySelectorAll('[data-bars]').forEach((el) => {
    let cfg; try { cfg = JSON.parse(el.dataset.bars); } catch (e) { return; }
    drawBars(el, cfg);
  });
  /* สลับตัวชี้วัดของกราฟ (หน้าข้อมูลสำคัญทางการเงิน) — ปุ่ม [data-metric] อ่านค่าจาก JSON ใน #fhData */
  const fhData = document.getElementById('fhData');
  if (fhData) {
    const D = JSON.parse(fhData.textContent);
    const chart = document.getElementById('fhBars');
    const out = (k) => document.querySelector(`[data-fh="${k}"]`);
    const btns = [...document.querySelectorAll('[data-metric]')];
    const legend = out('legend');
    const show = (b) => {
      const m = D.metrics[Number(b.dataset.metric)];
      btns.forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      /* แสดงตัวเลขตามข้อความในตารางของบริษัท (text) ไม่คำนวณค่าเพิ่ม */
      const first = m.series ? m.series[0] : m;
      const txt = first.text[D.last];
      out('name').textContent = m.name;
      out('unit').textContent = m.unit;
      const v = out('value'); v.textContent = txt; v.classList.toggle('is-neg', /^-\d/.test(txt));
      const sub = out('sub');
      if (m.series) { sub.hidden = false; sub.innerHTML = m.series.map((s) => `<span class="${s.cls}"><i></i>${s.name} <b>${s.text[D.last]}</b></span>`).join(''); }
      else { sub.hidden = true; sub.textContent = ''; }
      if (legend) legend.innerHTML = m.series ? m.series.map((s) => `<span><i class="${s.cls}"></i>${s.name}</span>`).join('') + legend.dataset.base.replace(/<span><i><\/i>[^<]*<\/span>/, '') : legend.dataset.base;
      out('title').textContent = m.name + ' (' + m.unit + ')';
      drawBars(chart, { labels: D.labels, values: m.values, text: m.text, series: m.series, partial: D.partial, dec: m.dec, title: m.name });
    };
    btns.forEach((b) => b.addEventListener('click', () => show(b)));
    /* จอเล็ก: ปุ่มชิปถูกซ่อน (CSS) → ใช้ dropdown ที่สร้างจากปุ่มชุดเดียวกัน พร้อม label */
    const pills = btns[0] && btns[0].closest('.tabs');
    if (pills) {
      const en = document.documentElement.lang === 'en';
      const wrap = document.createElement('div');
      wrap.className = 'field fh-select';
      wrap.innerHTML = '<label class="field-label" for="fhSelect">' + (en ? 'Select chart' : 'เลือกดูกราฟ') + '</label><div class="field-select"><select class="field-input" id="fhSelect">' +
        btns.map((b, i) => '<option value="' + i + '">' + b.textContent.trim() + '</option>').join('') + '</select></div>';
      pills.after(wrap);
      const sel = wrap.querySelector('select');
      sel.addEventListener('change', () => show(btns[Number(sel.value)]));
      btns.forEach((b, i) => b.addEventListener('click', () => { sel.value = String(i); }));
    }
    /* แสดงตัวเลือกที่ active ตั้งแต่โหลด (รวมโหมดแท่งคู่ + คำอธิบายสี) */
    const act = btns.find((b) => b.classList.contains('is-active'));
    if (act) show(act);
    show.ready = true;
  }

  /* ---------- ตาราง [data-crosshair]: ชี้เซลล์แล้วไฮไลต์ทั้งคอลัมน์ (แถวไฮไลต์ด้วย CSS) ---------- */
  document.querySelectorAll('table[data-crosshair]').forEach((tbl) => {
    let col = -1;
    const mark = (i) => {
      if (i === col) return;
      tbl.querySelectorAll('.is-col').forEach((c) => c.classList.remove('is-col'));
      col = i;
      if (i < 1) return;
      tbl.querySelectorAll('tr').forEach((r) => { const c = r.children[i]; if (c && !r.classList.contains('row-group')) c.classList.add('is-col'); });
    };
    tbl.addEventListener('pointerover', (e) => { const c = e.target.closest('td, th'); if (c && c.parentElement.children.length > 2) mark([...c.parentElement.children].indexOf(c)); });
    tbl.addEventListener('pointerleave', () => mark(-1));
  });

  /* ---------- แสดงทั้งหมด (ตารางยาว) ---------- */
  document.querySelectorAll('[data-more]').forEach((b) => {
    const tbl = document.getElementById(b.dataset.more);
    if (!tbl) return;
    const lab = b.querySelector('span'), ic = b.querySelector('.icon');
    b.addEventListener('click', () => {
      const all = tbl.classList.toggle('is-all');
      b.setAttribute('aria-expanded', String(all));
      if (lab) lab.textContent = all ? T('แสดงน้อยลง', 'Show less') : b.dataset.label;
      if (ic) ic.style.transform = all ? 'rotate(180deg)' : '';
      if (all) pop([...tbl.querySelectorAll('tr.row-more')]);
    });
  });

  /* ---------- เส้นเวลา RO / ตัวนับข้อความ ---------- */
  document.querySelectorAll('.ro-steps').forEach((s) => {
    [...s.children].forEach((li, k) => li.style.setProperty('--k', k));
    if (reduce || !('IntersectionObserver' in window)) { s.classList.add('in'); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { s.classList.add('in'); io.disconnect(); } }), { threshold: 0.35 });
    io.observe(s);
  });
  document.querySelectorAll('[data-counter]').forEach((ta) => {
    const out = document.getElementById(ta.dataset.counter);
    const max = Number(ta.getAttribute('maxlength')) || 0;
    const upd = () => { if (!out) return; out.textContent = `${ta.value.length.toLocaleString()} / ${max.toLocaleString()}`; out.classList.toggle('is-max', max && ta.value.length >= max); };
    ta.addEventListener('input', upd); upd();
  });

  /* ---------- แนบไฟล์: ตรวจชนิด / ขนาด / จำนวน แล้วแสดงเป็นชิป ---------- */
  document.querySelectorAll('[data-files]').forEach((inp) => {
    const field = inp.closest('.field');
    const drop = inp.closest('.file-drop');
    const list = field.querySelector('.file-list');
    const err = field.querySelector('.field-error');
    const maxN = Number(inp.dataset.max || 3), maxB = Number(inp.dataset.size || 2) * 1024 * 1024;
    const exts = (inp.getAttribute('accept') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    let files = [];
    const render = () => {
      list.innerHTML = files.map((f, i) => `<li><i class="icon" aria-hidden="true">attach_file</i><span>${f.name.replace(/[&<>"]/g, '')}</span><small>${(f.size / 1024 / 1024).toFixed(2)} MB</small><button type="button" data-i="${i}" aria-label="${T('ลบไฟล์', 'Remove file')} ${f.name.replace(/"/g, '')}"><i class="icon" aria-hidden="true">close</i></button></li>`).join('');
      try { const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); inp.files = dt.files; } catch (e) { /* เบราว์เซอร์เก่า */ }
    };
    const fail = (msg) => { field.classList.add('is-invalid'); err.textContent = msg; };
    inp.addEventListener('change', () => {
      field.classList.remove('is-invalid');
      const add = [...inp.files];
      for (const f of add) {
        const ext = '.' + f.name.split('.').pop().toLowerCase();
        if (exts.length && !exts.includes(ext)) { fail(T(`ไม่รองรับไฟล์ ${ext}`, `${ext} files are not supported`)); continue; }
        if (f.size > maxB) { fail(T(`ไฟล์ ${f.name} มีขนาดเกิน ${inp.dataset.size || 2}MB`, `${f.name} is larger than ${inp.dataset.size || 2}MB`)); continue; }
        if (files.length >= maxN) { fail(T(`แนบได้สูงสุด ${maxN} ไฟล์`, `Up to ${maxN} files`)); break; }
        if (!files.some((x) => x.name === f.name && x.size === f.size)) files.push(f);
      }
      render();
    });
    list.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; files.splice(Number(b.dataset.i), 1); field.classList.remove('is-invalid'); render(); });
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.add('is-over')));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('is-over')));
  });

  /* ---------- Dropdown เลือกหลายข้อ (.field-multi): สรุปข้อความ / เลือกทั้งหมด / ปิดเมื่อคลิกนอก ---------- */
  document.querySelectorAll('details[data-multi]').forEach((dd) => {
    const label = dd.querySelector('[data-multi-label]');
    const all = dd.querySelector('[data-multi-all]');
    const boxes = [...dd.querySelectorAll('input[type=checkbox]:not([data-multi-all])')];
    const sync = () => {
      const on = boxes.filter((b) => b.checked);
      if (all) { all.checked = on.length === boxes.length; all.indeterminate = on.length > 0 && on.length < boxes.length; }
      label.textContent = !on.length ? dd.dataset.none : on.length === boxes.length ? dd.dataset.all
        : on.length <= 2 ? on.map((b) => b.closest('label').textContent.trim()).join(', ') : `${on.length} ${dd.dataset.unit}`;
    };
    if (all) all.addEventListener('change', () => { boxes.forEach((b) => { b.checked = all.checked; }); sync(); boxes[0].dispatchEvent(new Event('change', { bubbles: true })); });
    boxes.forEach((b) => b.addEventListener('change', sync));
    document.addEventListener('click', (e) => { if (dd.open && !dd.contains(e.target)) dd.open = false; });
    dd.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dd.open) { dd.open = false; dd.querySelector('summary').focus(); } });
    dd.closest('form')?.addEventListener('reset', () => setTimeout(sync));
    sync();
  });

  /* ---------- ฟอร์ม: ตรวจข้อมูลก่อนส่ง → สถานะกำลังส่ง → แผงสำเร็จ ----------
     <div class="fm-card"><form data-form novalidate>…</form><div class="fm-done" tabindex="-1">…</div></div>
     ข้อความผิดพลาดของแต่ละช่อง: data-err (ว่าง) / data-err-type (รูปแบบไม่ถูกต้อง)
     ยังไม่ได้ต่อระบบหลังบ้าน — แทนที่ setTimeout ด้วย fetch() ไปยัง endpoint จริง */
  const msgOf = (el) => {
    if (el.validity.valueMissing) return el.dataset.err || (el.type === 'checkbox' ? T('กรุณายอมรับเงื่อนไขก่อนดำเนินการต่อ', 'Please accept to continue') : T('กรุณากรอกข้อมูลในช่องนี้', 'This field is required'));
    if (el.validity.typeMismatch || el.validity.patternMismatch) return el.dataset.errType || (el.type === 'email' ? T('รูปแบบอีเมลไม่ถูกต้อง เช่น name@example.com', 'Enter a valid email, e.g. name@example.com') : T('รูปแบบข้อมูลไม่ถูกต้อง', 'Invalid format'));
    if (el.validity.tooShort) return T(`กรุณากรอกอย่างน้อย ${el.minLength} ตัวอักษร`, `Enter at least ${el.minLength} characters`);
    return '';
  };
  const check = (el) => {
    const field = el.closest('.field');
    if (!field) return true;
    const err = field.querySelector('.field-error');
    const m = el.checkValidity() ? '' : msgOf(el);
    field.classList.toggle('is-invalid', !!m);
    el.setAttribute('aria-invalid', String(!!m));
    if (err) err.textContent = m;
    return !m;
  };
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const card = form.closest('.fm-card');
    const done = card && card.querySelector('.fm-done');
    const ctrls = () => [...form.querySelectorAll('input:not([type=file]), select, textarea')].filter((el) => el.closest('.field'));
    ctrls().forEach((el) => {
      const err = el.closest('.field').querySelector('.field-error');
      if (err && err.id) el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), err.id].filter(Boolean).join(' '));
      el.addEventListener(el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT' ? 'change' : 'blur', () => { if (el.value || el.closest('.field').classList.contains('is-invalid')) check(el); });
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('is-invalid')) check(el); });
    });
    /* กลุ่มเช็กบ็อกซ์ที่ต้องเลือกอย่างน้อย 1 ข้อ: <div class="field" data-need-one> */
    const groupOk = () => [...form.querySelectorAll('[data-need-one]')].every((g) => {
      const ok = !!g.querySelector('input:checked');
      g.classList.toggle('is-invalid', !ok);
      const err = g.querySelector('.field-error'); if (err) err.textContent = ok ? '' : (g.dataset.err || T('กรุณาเลือกอย่างน้อย 1 ข้อ', 'Choose at least one'));
      return ok;
    });
    form.querySelectorAll('[data-need-one] input').forEach((i) => i.addEventListener('change', () => { if (i.closest('.field').classList.contains('is-invalid')) groupOk(); }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = ctrls().filter((el) => !check(el));
      const gOk = groupOk();
      const fileBad = form.querySelector('.file-drop') && form.querySelector('.file-drop').closest('.field').classList.contains('is-invalid');
      if (bad.length || !gOk || fileBad) {
        const first = bad[0] || form.querySelector('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea');
        if (first) { first.focus({ preventScroll: true }); first.closest('.field').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
        return;
      }
      const btn = form.querySelector('[type=submit]');
      const ic = btn && btn.querySelector('.icon');
      const icTxt = ic && ic.textContent;
      if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); if (ic) ic.textContent = 'refresh'; }
      setTimeout(() => {
        if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); if (ic) ic.textContent = icTxt; }
        const ref = card && card.querySelector('[data-ref]');
        if (ref) ref.textContent = `${ref.dataset.ref}-${new Date().getFullYear() + (EN ? 0 : 543)}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        const mail = card && card.querySelector('[data-echo="email"]');
        const em = form.querySelector('input[type=email]');
        if (mail && em) mail.textContent = em.value;
        if (card) card.classList.add('is-done');
        if (done) { done.focus({ preventScroll: true }); card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
      }, 900);
    });
    if (done) done.querySelectorAll('[data-again]').forEach((b) => b.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.file-list').forEach((l) => { l.innerHTML = ''; });
      form.querySelectorAll('[data-counter]').forEach((t) => t.dispatchEvent(new Event('input')));
      form.querySelectorAll('.field.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
      card.classList.remove('is-done');
      const f1 = form.querySelector('input, select, textarea'); if (f1) f1.focus();
    }));
  });

  /* ---------- แชร์บทความ: คัดลอกลิงก์ / แถบความคืบหน้าการอ่าน ---------- */
  document.querySelectorAll('[data-copy-link]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast(T('คัดลอกลิงก์แล้ว', 'Link copied')); }
    catch (e) { toast(location.href); }
  }));
  document.querySelectorAll('[data-share]').forEach((a) => {
    const u = encodeURIComponent(location.href), t = encodeURIComponent(document.title);
    const map = { facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`, x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, line: `https://social-plugins.line.me/lineit/share?url=${u}`, mail: `mailto:?subject=${t}&body=${u}` };
    if (map[a.dataset.share]) a.href = map[a.dataset.share];
  });
  const prog = document.querySelector('.rd-progress');
  const art = document.querySelector('.rd-body');
  if (prog && art) {
    let raf = 0;
    const upd = () => { raf = 0; const r = art.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (window.innerHeight * 0.4 - r.top) / Math.max(1, r.height))); prog.style.setProperty('--p', p.toFixed(4)); };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  /* ---------- 404: แสงและเครื่องหมาย RPC ขยับตามเมาส์ ---------- */
  const nf = document.querySelector('.nf');
  if (nf && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const mark = nf.querySelector('.nf-mark');
    let raf = 0;
    nf.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = nf.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        nf.style.setProperty('--mx', x + 'px'); nf.style.setProperty('--my', y + 'px');
        if (mark) { mark.style.setProperty('--tx', ((x / r.width - 0.5) * 24).toFixed(1) + 'px'); mark.style.setProperty('--ty', ((y / r.height - 0.5) * 24).toFixed(1) + 'px'); }
      });
    });
  }
  /* ---------- พันธกิจ bento: พื้นหลังพารัลแลกซ์ · เลขนับขึ้น · รูปเลื่อนในกรอบ · spotlight การ์ด · ลายน้ำตามเมาส์ ---------- */
  const vmSec = document.getElementById('mission');
  const vmBento = vmSec && vmSec.querySelector('.vm-bento');
  if (vmBento && !reduce && window.gsap && window.ScrollTrigger) {
    gsap.fromTo(vmSec, { '--bgy': -100 }, { '--bgy': 100, ease: 'none', scrollTrigger: { trigger: vmSec, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    vmBento.querySelectorAll('.vm-m-img').forEach((fig) => {
      gsap.fromTo(fig, { '--py': -7 }, { '--py': 7, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    const num = vmBento.querySelector('.vm-b-num');
    if (num) {
      const end = parseInt(num.textContent, 10) || 0, o = { v: 0 };
      ScrollTrigger.create({ trigger: vmBento, start: 'top 70%', once: true, onEnter: () => {
        num.textContent = '0';
        gsap.to(o, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: () => { num.textContent = String(Math.round(o.v)); }, onComplete: () => { num.textContent = String(end); } });
      } });
    }
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      vmBento.querySelectorAll('.vm-m-text').forEach((card) => card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px'); card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }));
      const hero = vmBento.querySelector('.vm-b-hero');
      if (hero) {
        hero.addEventListener('pointermove', (e) => {
          const r = hero.getBoundingClientRect();
          hero.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5) * -36 + 'px'); hero.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5) * -36 + 'px');
        });
        hero.addEventListener('pointerleave', () => { hero.style.setProperty('--tx', '0px'); hero.style.setProperty('--ty', '0px'); });
      }
    }
  }
  /* ---------- ธุรกิจของเรา motion (business.html) — เล่าเรื่องเป็นบท · GSAP ScrollTrigger · ปิดเมื่อลดการเคลื่อนไหว ----------
     hero พารัลแลกซ์ · ตัวเลขนับขึ้น · เส้นสถิติวาด · ทางแยกเผยจากกลาง · เลขบทเลื่อนเข้า · ภาพเวทีเปิดกรอบ
      · บทส่งท้ายเผยทีละบรรทัด */
  if (document.querySelector('.bz-fx') && !reduce && window.gsap && window.ScrollTrigger) {
    const g = window.gsap, ST = window.ScrollTrigger;
    g.registerPlugin(ST);
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    /* hero: ภาพเลื่อนช้ากว่าเนื้อหาเล็กน้อย (ขนาดเท่าหน้าย่อยอื่น) */
    const hero = document.querySelector('.page-hero');
    if (hero) g.to(hero.querySelector('.page-hero-media'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    /* ตัวเลขนับขึ้น */
    document.querySelectorAll('[data-bz-count]').forEach((el) => {
      const end = Number(el.dataset.bzCount), o = { v: 0 };
      el.textContent = '0';
      ST.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => g.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } }) });
    });
    /* แถวสถิติ: เส้นบนวาดเข้า + ช่องไล่ขึ้น */
    const stats = document.querySelector('.bz-stats');
    if (stats) {
      g.from(stats, { borderTopColor: 'transparent', duration: 0.1, scrollTrigger: { trigger: stats, start: 'top 88%', once: true } });
      g.from(stats.children, { opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: stats, start: 'top 85%', once: true } });
    }
    /* ทางแยก: สองฝั่งเผยจากกลางออกด้านนอก */
    const paths = g.utils.toArray('.bz-path');
    if (paths.length) {
      paths.forEach((p, i) => g.fromTo(p, { clipPath: i ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', ease: 'none', scrollTrigger: { trigger: '.bz-fork', start: 'top 92%', end: 'top 35%', scrub: 0.6 } }));
      g.from('.bz-path-body', { opacity: 0, y: 40, duration: 1, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: '.bz-fork', start: 'top 60%', once: true } });
    }
    /* เลขบท: เลื่อนเข้าพร้อมเส้นนำ */
    g.utils.toArray('.bz-chap-no').forEach((n) => g.from(n, { opacity: 0, x: -30, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 88%', once: true } }));
    /* ภาพเวทีสถานี: กรอบเปิดออกเต็มกว้าง + รูปเลื่อนช้ากว่า */
    document.querySelectorAll('.bz-clip').forEach((fig) => {
      g.fromTo(fig, { clipPath: 'inset(12% 16% 12% 16% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none', scrollTrigger: { trigger: fig, start: 'top 92%', end: 'top 25%', scrub: 0.6 } });
      g.fromTo(fig, { '--py': -6 }, { '--py': 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
      const cap = fig.querySelector('.bz-stage-cap');
      if (cap) g.from(cap, { opacity: 0, y: 40, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 55%', once: true } });
    });
    /* พื้นหลังครอบครัวบนสุดของบทที่ 2: เลื่อนช้ากว่าเนื้อหา */
    const estBg = document.querySelector('.bz-estate-bg');
    if (estBg) g.fromTo(estBg, { y: -20 }, { y: 70, ease: 'none', scrollTrigger: { trigger: '#estate', start: 'top bottom', end: 'top top', scrub: true } });
    /* กล่องแนวคิด: ขยายจากกรอบเล็ก + ลายน้ำเลื่อน */
    const concept = document.querySelector('.bz-concept');
    if (concept) {
      g.fromTo(concept, { clipPath: 'inset(10% 8% 10% 8% round 24px)', scale: 0.96 }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', scale: 1, ease: 'none', scrollTrigger: { trigger: concept, start: 'top 95%', end: 'top 45%', scrub: 0.6 } });
      g.from(concept.querySelectorAll('.fact-label, h3, p'), { opacity: 0, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: concept, start: 'top 70%', once: true } });
      const cimg = concept.querySelectorAll('.bz-concept-img');
      if (cimg.length) g.fromTo(cimg, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: concept, start: 'top bottom', end: 'bottom top', scrub: true } });
      const wm = concept.querySelector('.ab-wm');
      if (wm) g.fromTo(wm, { xPercent: 12 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: concept, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    /* เส้นใต้รายการกลุ่มลูกค้าวาดเข้า */
    document.querySelectorAll('.bz-draw .vm-pillar').forEach((li, i) => {
      li.style.setProperty('--d', 0);
      g.to(li, { '--d': 1, duration: 1.2, ease: 'expo.out', delay: i * 0.12, scrollTrigger: { trigger: li, start: 'top 90%', once: true } });
      g.from(li.children, { opacity: 0, y: 20, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: i * 0.12, scrollTrigger: { trigger: li, start: 'top 90%', once: true } });
    });
    /* บทส่งท้าย: หัวข้อเผยทีละบรรทัดจากแถบมาสก์ + ลายน้ำเลื่อน */
    const end = document.querySelector('.bz-end-title');
    if (end) {
      const lines = end.innerHTML.split(/<br\s*\/?>/i);
      end.innerHTML = lines.map((l) => '<span class="ln"><span class="ln-in">' + l + '</span></span>').join('');
      g.from(end.querySelectorAll('.ln-in'), { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.14, scrollTrigger: { trigger: end, start: 'top 82%', once: true } });
      g.from('.bz-end-cta .button', { opacity: 0, y: 24, duration: 1, ease: 'expo.out', stagger: 0.1, delay: 0.4, scrollTrigger: { trigger: end, start: 'top 82%', once: true } });
      const wm = document.querySelector('.bz-end .ab-wm');
      if (wm) g.fromTo(wm, { xPercent: 14 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: '.bz-end', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }
  /* scrollytelling .bz-fx (business.html: ปัจจัยสนับสนุน + ลักษณะผลิตภัณฑ์): กรอบรูปติดซ้าย รูปเปลี่ยนเมื่อหัวข้อของข้อนั้นเลื่อนขึ้นมาถึงกลางจอ
     คำนวณจากตำแหน่งเลื่อนจริง (ไม่พึ่ง GSAP จึงทำงานแม้ลดการเคลื่อนไหว) */
  document.querySelectorAll('.bz-fx').forEach((fx) => {
    const items = [...fx.querySelectorAll('.bz-fx-item')], imgs = [...fx.querySelectorAll('.bz-fx-frame img')], cur = fx.querySelector('[data-fx-cur]');
    let now = -1, tick = false;
    fx.classList.add('is-live');
    const setActive = (i) => {
      if (i === now) return; now = i;
      items.forEach((el, k) => el.classList.toggle('is-active', k === i));
      imgs.forEach((el, k) => el.classList.toggle('is-on', k === i));
      if (cur) cur.textContent = String(i + 1).padStart(2, '0');
    };
    const update = () => {
      tick = false;
      /* สลับเมื่อหัวข้อของข้อถัดไป "ขึ้นมาถึง" กลางจอ (ไม่ใช่แค่ใกล้กลางจอกว่าข้อเดิม) → อยู่กับข้อเดิมจนเลื่อนพ้นจริง */
      const mid = window.innerHeight / 2; let best = 0;
      items.forEach((el, i) => { const r = el.querySelector('h3').getBoundingClientRect(); if (r.top + r.height / 2 <= mid) best = i; });
      setActive(best);
    };
    const queue = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  });
  /* หน้าติดต่อ: ที่อยู่ในการ์ดสำนักงานใหญ่/โรงงานสูงเท่ากัน → แถว "โทร." เริ่มระดับเดียวกัน (เฉพาะจอที่การ์ดวางคู่กัน) */
  const ctGrid = document.querySelector('.ct-grid');
  if (ctGrid) {
    const addrs = [...ctGrid.querySelectorAll('.ct-addr')];
    const eq = () => {
      ctGrid.style.removeProperty('--ct-addr-h');
      if (!matchMedia('(min-width: 992px)').matches) return;
      ctGrid.style.setProperty('--ct-addr-h', Math.max(...addrs.map((a) => a.getBoundingClientRect().height)) + 'px');
    };
    eq();
    window.addEventListener('resize', eq);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(eq);
  }
})();

/* ---------- Lightbox รูปแผนภาพ (โครงสร้างองค์กร / ผู้ถือหุ้น) — lightGallery ----------
   คลิกรูป .ab-slot-zoom → เปิด lightGallery · ซูม/เลื่อน (lg-zoom) · เต็มจอ · ดาวน์โหลด · URL #lg=1&slide=0 (lg-hash)
   ไม่มี lightGallery / JS → ลิงก์เปิดรูปตามปกติ */
(() => {
  if (typeof window.lightGallery !== 'function') return;
  const h1 = document.querySelector('.page-hero-title');
  const cap = h1 ? h1.textContent.trim() : '';
  document.querySelectorAll('a.ab-slot-zoom').forEach((a) => {
    a.removeAttribute('target');
    if (cap) a.dataset.subHtml = `<h4>${cap}</h4>`;
    lightGallery(a.parentElement, {
      selector: 'a.ab-slot-zoom',
      plugins: [window.lgZoom, window.lgFullscreen, window.lgHash].filter(Boolean),
      licenseKey: '0000-0000-000-0000', /* ใส่ license key จริงเมื่อซื้อ (ใช้ในเว็บเชิงพาณิชย์) */
      download: true,
      counter: true,
      mobileSettings: { controls: false, showCloseIcon: true, download: true },
      actualSize: true,
      showZoomInOutIcons: true
    });
  });
})();
