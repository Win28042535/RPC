const irReady = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());
irReady(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Simple index-based carousel: syncs one or more groups of slides */
  const carousel = ({ groups, prev, next, onChange, autoplay = 0 }) => {
    const lists = groups.map(g => [...document.querySelectorAll(g)]);
    const total = lists[0].length;
    if (!total) return;
    let index = 0;
    let timer = null;
    const go = (i) => {
      lists.forEach(list => {
        list[index].classList.remove('is-active');
        list[(i + total) % total].classList.add('is-active');
      });
      index = (i + total) % total;
      if (onChange) onChange(index, total);
    };
    const restart = () => {
      clearInterval(timer);
      if (autoplay && !reduceMotion) timer = setInterval(() => go(index + 1), autoplay);
    };
    document.getElementById(prev)?.addEventListener('click', () => { go(index - 1); restart(); });
    document.getElementById(next)?.addEventListener('click', () => { go(index + 1); restart(); });
    restart();
  };

  carousel({
    groups: ['#irpCal .irp-cal-slide'],
    prev: 'irpCalPrev',
    next: 'irpCalNext'
  });

  /* Scroll-scrubbed image parallax (same recipe as the home page About
     background): the image drifts and eases in scale while its section
     travels through the viewport. */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    /* Hero ตรึง + ลอยขึ้น/เบลอตอนส่วนถัดไปทับ — เฉพาะจอ ≥992px (แยก matchMedia เพื่อให้ย่อต่ำกว่า 992px แล้วยกเลิกทันที) */
    gsap.matchMedia().add('(min-width: 992px)', () => {
      const hero = document.querySelector('.irp-hero');
      if (!hero) return;
      const cover = () => ({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true });
      gsap.to(hero, { yPercent: -30, ease: 'none', scrollTrigger: cover() });
      gsap.fromTo(hero, { filter: 'blur(0px)' }, { filter: 'blur(14px)', ease: 'power3.in', scrollTrigger: cover() });
    });
    gsap.matchMedia().add('(min-width: 768px)', () => {
      document.querySelectorAll('[data-irp-parallax]').forEach(el => {
        const trigger = el.closest('.irp-band, .irp-hub, .irp-land, .irp-hero');
        gsap.fromTo(el,
          { yPercent: -4, scale: 1.04 },
          { yPercent: 6, scale: 1.11, ease: 'none',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    });
  }

  /* ---------- Band motion (#irpBand) ----------------------------------------
     1) ทางลัดสไลด์: wipe ตามทิศ, autoplay ด้วยแถบเวลาใน dot (CSS animation
        → animationend เลื่อนสไลด์), หยุดเมื่อ hover/focus/นอกจอ, ปัดได้, ลูกศรคีย์บอร์ด
     2) GSAP: band คลี่ออกตาม scroll, การ์ด + หัวข้อ + pill ไล่เข้า,
        การ์ดเอียง 3D + แสงสะท้อน, spotlight ตามเมาส์, ปุ่ม magnetic */
  const band = document.getElementById('irpBand');
  const wg = band?.querySelector('.irp-contact-card');
  if (wg) {
    const slides = [...wg.querySelectorAll('.irp-wg-slide')];
    const dots = [...wg.querySelectorAll('[data-wg-dot]')];
    let cur = 0;
    const go = (i, dir) => {
      const n = (i + slides.length) % slides.length;
      if (n === cur) return;
      wg.dataset.dir = dir || (n > cur ? 'next' : 'prev');
      const out = slides[cur];
      out.classList.remove('is-active');
      out.classList.add('is-leaving');
      out.inert = true;
      clearTimeout(out._t);
      out._t = setTimeout(() => out.classList.remove('is-leaving'), 1100);
      cur = n;
      const inc = slides[cur];
      inc.classList.remove('is-leaving');
      inc.classList.add('is-active');
      inc.inert = false;
      dots.forEach((d, k) => {
        const on = k === cur;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on);
        d.tabIndex = on ? 0 : -1;
      });
    };
    dots.forEach((d, k) => { d.tabIndex = k === cur ? 0 : -1; });
    wg.querySelector('[data-wg-prev]').addEventListener('click', () => go(cur - 1, 'prev'));
    wg.querySelector('[data-wg-next]').addEventListener('click', () => go(cur + 1, 'next'));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    wg.querySelector('.irp-wg-dots').addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      go(cur + step, step > 0 ? 'next' : 'prev');
      dots[cur].focus();
    });

    /* autoplay: แถบใน dot วิ่งจนจบ → สไลด์ถัดไป (reduced-motion ไม่มี animation จึงไม่ autoplay) */
    dots.forEach(d => d.addEventListener('animationend', (e) => {
      if (e.animationName === 'wgProgress' && d.classList.contains('is-active')) go(cur + 1, 'next');
    }));
    let hovering = false, focused = false, visible = false;
    const syncPause = () => wg.classList.toggle('is-paused', hovering || focused || !visible || document.hidden);
    wg.addEventListener('pointerenter', () => { hovering = true; syncPause(); });
    wg.addEventListener('pointerleave', () => { hovering = false; syncPause(); });
    wg.addEventListener('focusin', () => { focused = true; syncPause(); });
    wg.addEventListener('focusout', () => { focused = wg.contains(document.activeElement); syncPause(); });
    document.addEventListener('visibilitychange', syncPause);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; syncPause(); }, { threshold: 0.4 }).observe(wg);
    syncPause();

    /* ปัดซ้าย/ขวาบนการ์ด */
    let sx = null, sy = 0;
    wg.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      sx = e.clientX; sy = e.clientY;
    });
    wg.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 'next' : 'prev');
    });
    wg.addEventListener('pointercancel', () => { sx = null; });
  }

  /* pill ทางลัด: ส่งจุดที่เมาส์เข้า/ออกให้ CSS เป็นจุดศูนย์กลางของวงเติมสี */
  band?.querySelectorAll('.irp-jump .tab').forEach(t => {
    const setOrigin = (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--fx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--fy', (e.clientY - r.top) + 'px');
    };
    t.addEventListener('pointerenter', setOrigin);
    t.addEventListener('pointerleave', setOrigin);
  });

  if (band && window.gsap && window.ScrollTrigger && !reduceMotion) {
    const card = band.querySelector('.irp-contact-card');
    const bg = band.querySelector('.irp-band-bg');
    const copy = band.querySelector('.irp-band-copy');
    const r = getComputedStyle(document.documentElement).getPropertyValue('--r-lg').trim();

    /* พื้น band คลี่ออกจากกรอบเล็ก → เต็ม ตามการ scroll */
    gsap.fromTo(bg,
      { clipPath: `inset(7% 3% 7% 3% round ${r})` },
      { clipPath: `inset(0% 0% 0% 0% round ${r})`, ease: 'none',
        scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 35%', scrub: 0.6 } });

    /* entrance ครั้งเดียวเมื่อ band เข้าจอ */
    const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.2 } });
    intro
      .from(card, { yPercent: 22, rotation: -4, autoAlpha: 0, duration: 1.4 }, 0)
      .from(copy.querySelector('.irp-next-btn'), { y: 16, autoAlpha: 0 }, 0.15)
      .from(copy.querySelector('.section-tag'), { x: -16, autoAlpha: 0 }, 0.2)
      .from(copy.querySelectorAll('.irp-mask > span'), { yPercent: 115, rotation: 3, duration: 1.3, stagger: 0.12 }, 0.25)
      .from(copy.querySelectorAll('.irp-jump .tab'), { y: 24, autoAlpha: 0, stagger: 0.06 }, 0.5);
    ScrollTrigger.create({ trigger: band, start: 'top 75%', once: true, onEnter: () => intro.play() });

    /* pointer interactions เฉพาะเมาส์ (ไม่ใช้บนจอสัมผัส) */
    gsap.matchMedia().add('(hover: hover) and (pointer: fine)', () => {
      /* การ์ดเอียง 3D + แสงสะท้อน */
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const onCard = (e) => {
        const b = card.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
        rx((0.5 - py) * 10);
        ry((px - 0.5) * 12);
        card.style.setProperty('--gx', px * 100 + '%');
        card.style.setProperty('--gy', py * 100 + '%');
      };
      const enterCard = () => card.classList.add('is-hover');
      const leaveCard = () => { card.classList.remove('is-hover'); rx(0); ry(0); };
      card.addEventListener('pointermove', onCard);
      card.addEventListener('pointerenter', enterCard);
      card.addEventListener('pointerleave', leaveCard);

      /* spotlight + ภาพพื้นขยับตามเมาส์เล็กน้อย */
      const glow = band.querySelector('.irp-band-glow');
      const img = band.querySelector('.irp-hub-img');
      const gx = gsap.quickTo(glow, 'x', { duration: 0.9, ease: 'power3.out' });
      const gy = gsap.quickTo(glow, 'y', { duration: 0.9, ease: 'power3.out' });
      const ix = gsap.quickTo(img, 'x', { duration: 1.4, ease: 'power3.out' });
      const onBand = (e) => {
        const b = band.getBoundingClientRect();
        gx(e.clientX - b.left);
        gy(e.clientY - b.top);
        ix(((e.clientX - b.left) / b.width - 0.5) * -24);
      };
      const enterBand = () => band.classList.add('is-hover');
      const leaveBand = () => { band.classList.remove('is-hover'); ix(0); };
      band.addEventListener('pointermove', onBand);
      band.addEventListener('pointerenter', enterBand);
      band.addEventListener('pointerleave', leaveBand);

      /* magnetic: ปุ่มดึงตามเมาส์ ข้อความข้างในตามไปอีกครึ่งจังหวะ */
      const magnets = [...band.querySelectorAll('.irp-wg-go, .irp-wg-nav .button, .irp-next-btn, .irp-jump .tab')];
      const cleanups = magnets.map(el => {
        const pull = el.matches('.tab') ? 0.22 : 0.35;
        const inner = el.matches('.tab') ? el.querySelector(':scope > span') : null;
        const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
        const tx = inner && gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' });
        const ty = inner && gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' });
        const move = (e) => {
          const b = el.getBoundingClientRect();
          const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
          mx(dx * pull); my(dy * pull);
          if (inner) { tx(dx * pull * 0.5); ty(dy * pull * 0.5); }
        };
        const leave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
          if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.set([el, inner].filter(Boolean), { x: 0, y: 0 }); };
      });

      return () => {
        card.removeEventListener('pointermove', onCard);
        card.removeEventListener('pointerenter', enterCard);
        card.removeEventListener('pointerleave', leaveCard);
        band.removeEventListener('pointermove', onBand);
        band.removeEventListener('pointerenter', enterBand);
        band.removeEventListener('pointerleave', leaveBand);
        cleanups.forEach(fn => fn());
      };
    });
  }
});
