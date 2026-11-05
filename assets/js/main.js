const rpcgReady = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());
rpcgReady(() => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero title line-by-line reveal */
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    if (reduceMotion) heroTitle.classList.add('in');
    else setTimeout(() => heroTitle.classList.add('in'), 100);
  }

  /* Hero floating card — rotating highlight slides */
  const hfcSlides = document.querySelectorAll('#heroFloatCard .hfc-slide');
  const hfcDots = document.querySelectorAll('#heroFloatCard .dot');
  if (hfcSlides.length && !reduceMotion) {
    let hfcIndex = 0;
    setInterval(() => {
      hfcSlides[hfcIndex].classList.remove('is-active');
      hfcDots[hfcIndex].classList.remove('is-active');
      hfcIndex = (hfcIndex + 1) % hfcSlides.length;
      hfcSlides[hfcIndex].classList.add('is-active');
      hfcDots[hfcIndex].classList.add('is-active');
    }, 3200);
  }

  /* Business showcase — two cards swap the background and the detail panel */
  const bizShow = document.getElementById('bizShow');
  if (bizShow) {
    const keys = [...bizShow.querySelectorAll('.biz-panel')].map(t => t.dataset.biz);
    const bizCount = document.getElementById('bizCount');
    const bizName = document.getElementById('bizName');
    let bizIndex = 0;
    let bizTimer = null;
    const setBizActive = (index) => {
      bizIndex = (index + keys.length) % keys.length;
      const key = keys[bizIndex];
      bizShow.querySelectorAll('[data-biz]').forEach(el => {
        const on = el.dataset.biz === key;
        el.classList.toggle('is-active', on);
        if (el.classList.contains('biz-thumb')) el.setAttribute('aria-selected', String(on));
      });
      if (bizCount) bizCount.textContent = `${String(bizIndex + 1).padStart(2, '0')}/${String(keys.length).padStart(2, '0')}`;
      if (bizName) bizName.textContent = bizShow.querySelector(`.biz-panel[data-biz="${key}"]`).dataset.label;
    };
    const startBizAutoplay = () => {
      clearInterval(bizTimer);
      if (!reduceMotion) bizTimer = setInterval(() => setBizActive(bizIndex + 1), 7000);
    };
    document.getElementById('bizPrev')?.addEventListener('click', () => { setBizActive(bizIndex - 1); startBizAutoplay(); });
    document.getElementById('bizNext')?.addEventListener('click', () => { setBizActive(bizIndex + 1); startBizAutoplay(); });
    /* การ์ดในฮีโร่: คลิกแล้วเลื่อนลงมาที่ส่วนธุรกิจ และเปิดบริษัทที่ตรงกับการ์ด */
    document.querySelectorAll('[data-biz-go]').forEach(link => {
      link.addEventListener('click', () => {
        const i = keys.indexOf(link.dataset.bizGo);
        if (i >= 0) { setBizActive(i); startBizAutoplay(); }
      });
    });
    /* energy-first: autoplay waits until the section is on screen, so visitors always meet PTEC first */
    if ('IntersectionObserver' in window) {
      const bizSeen = new IntersectionObserver((entries) => {
        if (!entries.some(e => e.isIntersecting)) return;
        bizSeen.disconnect();
        setBizActive(0); startBizAutoplay();
      }, { threshold: 0.4 });
      bizSeen.observe(bizShow);
    } else startBizAutoplay();
  }

  /* History timeline — rotating era slides with fill-underline year nav */
  const historySlides = document.querySelectorAll('#history .history-slide');
  const historyNavItems = document.querySelectorAll('#history .history-nav-item');
  if (historySlides.length && historyNavItems.length) {
    let historyIndex = 0;
    let historyTimer = null;
    const setHistoryActive = (index) => {
      historySlides[historyIndex].classList.remove('is-active');
      historyNavItems[historyIndex].classList.remove('is-active');
      historyIndex = index;
      historySlides[historyIndex].classList.add('is-active');
      historyNavItems[historyIndex].classList.add('is-active');
    };
    const startHistoryAutoplay = () => {
      if (reduceMotion) return;
      clearInterval(historyTimer);
      historyTimer = setInterval(() => setHistoryActive((historyIndex + 1) % historySlides.length), 6000);
    };
    historyNavItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (i === historyIndex) return;
        setHistoryActive(i);
        startHistoryAutoplay();
      });
    });
    const historyPrev = document.querySelector('#history .history-arrow.prev');
    const historyNext = document.querySelector('#history .history-arrow.next');
    if (historyPrev) historyPrev.addEventListener('click', () => {
      setHistoryActive((historyIndex - 1 + historySlides.length) % historySlides.length);
      startHistoryAutoplay();
    });
    if (historyNext) historyNext.addEventListener('click', () => {
      setHistoryActive((historyIndex + 1) % historySlides.length);
      startHistoryAutoplay();
    });
    startHistoryAutoplay();
  }

  /* History directory — a single, user-selected open chapter at a time */
  const historyEntries = [...document.querySelectorAll('#history details.history-entry')];
  historyEntries.forEach(entry => {
    entry.querySelector('summary').addEventListener('click', () => {
      if (!entry.open) {
        historyEntries.forEach(other => {
          if (other !== entry) other.open = false;
        });
      }
    });
    entry.addEventListener('toggle', () => {
      if (!entry.open) return;
      historyEntries.forEach(other => {
        if (other !== entry && other.open) other.open = false;
      });
    });
  });

  /* Scroll-linked word reveal — darkens words as the heading crosses the viewport */
  const initWordReveal = (heading) => {
    if (!heading) return;
    const words = heading.querySelectorAll('.word');
    if (!words.length) return;
    if (reduceMotion) {
      words.forEach(w => w.classList.add('is-dark'));
      return;
    }
    let ticking = false;
    const update = () => {
      const rect = heading.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.88;
      const end = vh * 0.32;
      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      const activeCount = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle('is-dark', i < activeCount));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    };
    document.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    update();
  };
  initWordReveal(document.getElementById('aboutHeading'));
  initWordReveal(document.getElementById('aboutLedgerText'));
  initWordReveal(document.getElementById('irpStrategyText'));

  /* hero: จัดตำแหน่งข้อความตามความสูงจริง (กลุ่มซ้ายยึดจากขอบล่าง ความสูงเปลี่ยนตามฟอนต์/ขนาดจอ)
     - 576–991px: ย่อหน้า hero-intro (ขวา) ชิดขอบบนเดียวกับกลุ่มคำขวัญ+ปุ่ม (ซ้าย)
     - ≤575px: RPC → คำขวัญ+ปุ่ม → ย่อหน้า เรียงชิดกันเป็นกลุ่มเดียว ย่อหน้ากว้างเต็ม */
  const heroLead = document.querySelector('.hero-lead');
  const heroIntro = document.querySelector('.hero-intro');
  const heroTitleEl = document.getElementById('heroTitle');
  if (heroLead && heroIntro) {
    const mqMid = window.matchMedia('(min-width:576px) and (max-width:1199.98px)');
    const mqMobile = window.matchMedia('(max-width:575.98px)');
    const alignHero = () => {
      heroLead.style.removeProperty('top'); heroLead.style.removeProperty('bottom');
      heroIntro.style.removeProperty('top'); heroIntro.style.removeProperty('bottom');
      const heroEl = document.querySelector('.hero');
      if (heroEl) heroEl.style.removeProperty('height');
      if (!heroTitleEl) return;
      /* ≤1199px: กลุ่มข้อความชิดกัน — คำขวัญ+ปุ่มอยู่ใต้ RPC; จอ 576–1199px ย่อหน้าอยู่ขวาชิดขอบบนเดียวกับคำขวัญ; มือถืออยู่ใต้ปุ่ม */
      const leadTop = heroTitleEl.offsetTop + heroTitleEl.offsetHeight + 20;
      if (mqMid.matches || mqMobile.matches) {
        heroLead.style.top = leadTop + 'px'; heroLead.style.bottom = 'auto';
        heroIntro.style.bottom = 'auto';
        heroIntro.style.top = (mqMobile.matches ? leadTop + heroLead.offsetHeight + 20 : leadTop) + 'px';
        /* จอ 576–1199px: ความสูง hero = ข้อความ + การ์ด dock (ไม่ให้ข้อความทับการ์ด) */
        const dock = document.querySelector('.hero-dock');
        if (mqMid.matches && heroEl && dock) {
          const textBottom = Math.max(leadTop + heroLead.offsetHeight, leadTop + heroIntro.offsetHeight);
          heroEl.style.height = Math.ceil(textBottom + 40 + dock.offsetHeight) + 'px';
        }
      }
    };
    alignHero();
    window.addEventListener('resize', alignHero);
    window.addEventListener('load', alignHero);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignHero);
  }

  /* Navbar scroll state */
  const nav = document.querySelector('.rpcg-nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);

    const backTop = document.querySelector('.back-top');
    if (!backTop) return;
    if (window.scrollY > 700) backTop.classList.add('show');
    else backTop.classList.remove('show');
    /* ความคืบหน้าการเลื่อนหน้า → วงรอบปุ่ม */
    const max = document.documentElement.scrollHeight - window.innerHeight;
    backTop.style.setProperty('--p', max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)).toFixed(1) : 0);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Collapse mobile nav on link click */
  document.querySelectorAll('.rpcg-nav a:not(.dropdown-toggle):not([data-menu])').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.querySelector('.navbar-collapse.show');
      if (collapse) bootstrap.Collapse.getOrCreateInstance(collapse).hide();
    });
  });

  /* In-page hash links: smooth-scroll via JS instead of CSS `scroll-behavior`,
     which fights with GSAP ScrollTrigger's own scroll-position tracking
     (causes stuck/erratic pins). */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .stagger');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
    /* กันพลาด: ถ้า observer ไม่ทำงานกับองค์ประกอบที่อยู่ในจอแล้ว (เช่น ข้อความ hero ESG) ให้เปิดแสดงเมื่อเลื่อน/ปรับขนาดจอ */
    let revealTick = false;
    const revealVisible = () => {
      revealTick = false;
      const vh = window.innerHeight;
      document.querySelectorAll('.reveal:not(.in), .reveal-scale:not(.in), .stagger:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top < vh * 0.9 && r.bottom > vh * 0.1) { el.classList.add('in'); revealObserver.unobserve(el); }
      });
    };
    const queueReveal = () => { if (!revealTick) { revealTick = true; requestAnimationFrame(revealVisible); } };
    setInterval(revealVisible, 400); /* สำรองสุดท้าย: ตรวจซ้ำเป็นระยะ เผื่อ observer/scroll event ไม่ทำงาน */
    window.addEventListener('scroll', queueReveal, { passive: true });
    window.addEventListener('resize', queueReveal);
    queueReveal();
  }

  /* Animated counters */
  const counters = document.querySelectorAll('[data-count]');
  const formatCount = (el, val) => {
    const decimals = el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0;
    const useGrouping = el.dataset.group !== 'false';
    el.textContent = val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping });
  };
  if (reduceMotion) {
    counters.forEach(el => formatCount(el, parseFloat(el.dataset.count)));
  } else {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          formatCount(el, target * eased);
          if (p < 1) requestAnimationFrame(step);
          else formatCount(el, target);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));
  }

  /* Scroll parallax on section images */
  const parallaxEls = document.querySelectorAll('.pimg:not(.esg-card .pimg), [data-parallax]');
  if (!reduceMotion && parallaxEls.length && window.matchMedia('(min-width: 768px)').matches) {
    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const factor = parseFloat(el.dataset.parallax) || 0.08;
        const clamp = parseFloat(el.dataset.parallaxClamp) || 40;
        const offset = Math.max(-clamp, Math.min(clamp, (center - vh / 2) * factor));
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });
      ticking = false;
    };
    const onScrollParallax = () => {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    };
    document.addEventListener('scroll', onScrollParallax);
    window.addEventListener('resize', onScrollParallax);
    updateParallax();
  }

  /* About & History — scroll-driven depth parallax (GSAP ScrollTrigger).
     Each layer is bound directly to scroll progress through its section
     (scrub: true) so motion tracks the scrollbar 1:1, not an eased catch-up.
     Amplitudes stay small on purpose — this is meant to read as quiet depth
     between layers, not a showy effect. Reading content (the history index
     list, the ledger copy) is left still; only imagery/display type drifts. */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: '(min-width: 768px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, (context) => {
      const { isDesktop, reduceMotion: prefersReduced } = context.conditions;
      if (!isDesktop || prefersReduced) return;

      /* Hero — เอฟเฟกต์ลอยขึ้น/เบลอแยกไปอยู่ใน matchMedia ≥1200px ด้านล่าง (ย่อหน้าต่างต่ำกว่า 1200px แล้วต้อง revert ทันที) */

      const scrubThrough = (el) => ({ trigger: el, start: 'top bottom', end: 'bottom top', scrub: true });

      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        const bg = aboutSection.querySelector('.about-parallax-bg');
        const masthead = aboutSection.querySelector('.about-masthead');
        const facts = aboutSection.querySelector('.about-facts-layer');
        const ledger = aboutSection.querySelector('.about-ledger');

        if (bg) gsap.fromTo(bg,
          { yPercent: -4, scale: 1.04 },
          { yPercent: 6, scale: 1.11, ease: 'none', scrollTrigger: scrubThrough(aboutSection) });

        if (masthead) gsap.fromTo(masthead,
          { y: -14 }, { y: 18, ease: 'none', scrollTrigger: scrubThrough(aboutSection) });

        if (facts) gsap.fromTo(facts,
          { y: 30 }, { y: -22, ease: 'none', scrollTrigger: scrubThrough(aboutSection) });

        if (ledger) gsap.fromTo(ledger,
          { y: 14 }, { y: -8, ease: 'none', scrollTrigger: scrubThrough(aboutSection) });
      }

      const historySection = document.getElementById('history');
      if (historySection) {
        const heading = historySection.querySelector('.history-cover h2');
        const tileA = historySection.querySelector('.history-tile-a');
        const tileB = historySection.querySelector('.history-tile-b');
        const tileC = historySection.querySelector('.history-tile-c');

        if (heading) gsap.fromTo(heading,
          { y: -22 }, { y: 26, ease: 'none', scrollTrigger: scrubThrough(historySection) });

        if (tileA) gsap.fromTo(tileA,
          { y: -32 }, { y: 22, ease: 'none', scrollTrigger: scrubThrough(historySection) });
        if (tileB) gsap.fromTo(tileB,
          { y: 26 }, { y: -40, ease: 'none', scrollTrigger: scrubThrough(historySection) });
        if (tileC) gsap.fromTo(tileC,
          { y: -16 }, { y: 34, ease: 'none', scrollTrigger: scrubThrough(historySection) });
      }
    });
  } else if (!reduceMotion && window.matchMedia('(min-width: 768px)').matches) {
    /* Fallback if the GSAP CDN fails to load: a lighter single-layer drift on the About background */
    const aboutSection = document.getElementById('about');
    const aboutBackground = aboutSection?.querySelector('.about-parallax-bg');
    if (aboutSection && aboutBackground) {
      let aboutTicking = false;
      const updateAboutParallax = () => {
        const rect = aboutSection.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const sectionCenter = rect.top + rect.height / 2;
        const shift = Math.max(-1, Math.min(1, (viewportCenter - sectionCenter) / ((window.innerHeight + rect.height) / 2)));
        aboutBackground.style.transform = `translate3d(0, ${(-shift * 60).toFixed(1)}px, 0) scale(1.07)`;
        aboutTicking = false;
      };
      const onAboutScroll = () => {
        if (!aboutTicking) { requestAnimationFrame(updateAboutParallax); aboutTicking = true; }
      };
      document.addEventListener('scroll', onAboutScroll, { passive: true });
      window.addEventListener('resize', onAboutScroll);
      updateAboutParallax();
    }
  }

  /* Business showcase — scroll parallax. The photo layer is 50% taller than
     the frame and drifts against the scroll, so the image moves slower than
     the card that holds it. */
  if (bizShow && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(bizShow.querySelector('.biz-show-bg'),
        { yPercent: -16 },
        { yPercent: 16, ease: 'none', scrollTrigger: { trigger: bizShow, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* Business highlights — pinned horizontal scroll. Vertical scroll drives the
     track sideways; a progress rail + counter tracks position, card photos
     wipe in and drift inside their frames, and the logo mark lags behind. Below 992px / reduced motion the CSS
     falls back to a native scroll-snap row. */
  const bhTrack = document.getElementById('bhTrack');
  if (bhTrack && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(min-width: 1200px) and (prefers-reduced-motion: no-preference)', () => {
      const pin = bhTrack.closest('.bh-pin');
      const distance = () => Math.max(0, bhTrack.scrollWidth - window.innerWidth);
      const pinTrigger = () => ({ trigger: pin, start: 'top top', end: () => '+=' + distance(), invalidateOnRefresh: true });

      const scrollTween = gsap.to(bhTrack, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { ...pinTrigger(), pin: true, scrub: true, anticipatePin: 1 }
      });

      const bhCards = [...bhTrack.querySelectorAll('.bh-card')];
      const bhNo = document.getElementById('bhNo');
      const bhFill = document.getElementById('bhFill');
      const bhTip = document.getElementById('bhMarkTip');
      const setBhProgress = (p) => {
        gsap.set(bhFill, { scaleX: p });
        bhTip.style.left = (p * 100).toFixed(2) + '%';
        let nearest = 0, best = Infinity;
        bhCards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - window.innerWidth * 0.45);
          if (d < best) { best = d; nearest = i; }
        });
        const label = String(nearest + 1).padStart(2, '0');
        if (bhNo.textContent !== label) bhNo.textContent = label;
      };
      ScrollTrigger.create({ ...pinTrigger(), onUpdate: (self) => setBhProgress(self.progress), onRefresh: (self) => setBhProgress(self.progress) });

      const bhMark = bhTrack.querySelector('.bh-mark');
      if (bhMark) gsap.to(bhMark, { x: () => distance() * 0.3, ease: 'none', scrollTrigger: { ...pinTrigger(), scrub: true } });

      bhTrack.querySelectorAll('.bh-card-figure').forEach(fig => {
        /* รูปแสดงเต็มกรอบตามสัดส่วนจริง — ไม่ซูม/เลื่อนรูป (parallax เดิมซูม 1.25 เท่าทำให้ขอบรูปถูกตัด) */
        gsap.fromTo(fig, { clipPath: 'inset(0% 0% 0% 100% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none', scrollTrigger: { trigger: fig, containerAnimation: scrollTween, start: 'left 100%', end: 'left 66%', scrub: true } });
      });

      const intro = bhTrack.querySelector('.bh-intro');
      gsap.timeline({ scrollTrigger: { trigger: '#bizHighlight', start: 'top 65%', once: true } })
        .from(intro.querySelectorAll('.section-tag, .bh-title'), { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: .12 })
        .from(intro.querySelector('.bh-mark'), { opacity: 0, scale: .85, duration: 1.6, ease: 'power3.out' }, 0.1);
    });
  }

  /* Hero (≥1200px): ตรึงด้วย CSS (position:sticky) แล้วลอยขึ้น + เบลอตอนส่วนถัดไปเลื่อนมาทับ
     แยก matchMedia ของตัวเอง เพื่อให้ย่อหน้าต่างต่ำกว่า 1200px แล้วยกเลิก (revert) ทันที ไม่ค้างเป็นช่องว่างใต้ hero */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add('(min-width: 1200px)', () => {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      const heroCoverTrigger = () => ({ trigger: '#about', start: 'top bottom', end: 'top top', scrub: true });
      gsap.to(hero, { yPercent: -30, ease: 'none', scrollTrigger: heroCoverTrigger() });
      gsap.fromTo(hero, { filter: 'blur(0px)' }, { filter: 'blur(14px)', ease: 'power3.in', scrollTrigger: heroCoverTrigger() });
    });
  }

  /* Investor shortcuts — circular reveal. A deep-blue disc grows from the
     seam with the previous section (same white, so the join is invisible); once it covers most of the
     section the heading text flips to its on-dark colours. */
  const explore = document.getElementById('explore');
  const exploreBg = explore && explore.querySelector('.explore-bg');
  if (exploreBg) {
    if (reduceMotion || !(window.gsap && window.ScrollTrigger)) {
      exploreBg.style.clipPath = 'none';
      explore.classList.add('is-inverted');
    } else {
      gsap.registerPlugin(ScrollTrigger);
      const mmExplore = gsap.matchMedia();
      /* จอ ≤1199px: ไม่มีเอฟเฟกต์วงกลมขยาย — แสดงพื้นเข้มคงที่ */
      mmExplore.add('(max-width: 1199.98px)', () => {
        exploreBg.style.clipPath = 'none';
        explore.classList.add('is-inverted');
        return () => { exploreBg.style.clipPath = ''; explore.classList.remove('is-inverted'); };
      });
      mmExplore.add('(min-width: 1200px)', () => {
        gsap.fromTo(exploreBg,
          { clipPath: 'circle(0% at 50% 0%)' },
          {
            clipPath: 'circle(110% at 50% 0%)', ease: 'none',
            scrollTrigger: {
              trigger: explore, start: 'top 80%', end: 'top 10%', scrub: true,
              onUpdate: (self) => explore.classList.toggle('is-inverted', self.progress > 0.55)
            }
          });
      });
    }
  }

  /* ESG hero — the backdrop photo drifts against the scroll. */
  const esgHero = document.querySelector('.esg-hero');
  if (esgHero && !reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(esgHero.querySelector('.esg-hero-bg'), { yPercent: -3 },
      { yPercent: 3, ease: 'none', scrollTrigger: { trigger: esgHero, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(esgHero.querySelector('.esg-soil'), { yPercent: -6 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: esgHero, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* Scroll progress bar */
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    let progressTicking = false;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.width = pct.toFixed(2) + '%';
      progressTicking = false;
    };
    const onScrollProgress = () => {
      if (!progressTicking) { requestAnimationFrame(updateProgress); progressTicking = true; }
    };
    document.addEventListener('scroll', onScrollProgress, { passive: true });
    window.addEventListener('resize', onScrollProgress);
    updateProgress();
  }

  /* Pointer tilt on image cards */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.proj-card:not(.esg-card)').forEach(card => {
      card.classList.add('tilt-el');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('is-tilting');
        card.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* Animated chart bars */
  const bars = document.querySelectorAll('.chart-col .bar');
  const barObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.height = entry.target.dataset.height;
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => barObserver.observe(b));

  /* Fake contact form submit */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const toast = document.getElementById('rpcgToast');
      toast.classList.add('show');
      form.reset();
      setTimeout(() => toast.classList.remove('show'), 3600);
    });
  }

  /* Footer newsletter submit */
  const subscribeForm = document.getElementById('footerSubscribeForm');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const toast = document.getElementById('rpcgToast');
      toast.classList.add('show');
      subscribeForm.reset();
      setTimeout(() => toast.classList.remove('show'), 3600);
    });
  }

  /* Bento — spotlight ตามเมาส์ */
  document.querySelectorAll('.bento-tile').forEach(tile => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Section progress nav — แคปซูล HUD: ตัวนับ · เส้น+จุดความคืบหน้า · ขีด dock ตามเมาส์ · การ์ดชื่อ section */
  const secNav = document.getElementById('secNav');
  const secTip = document.getElementById('secNavTip');
  if (secNav && secTip) {
    const navSections = [...document.querySelectorAll('[data-nav]')];
    const pad2 = (n) => String(n).padStart(2, '0');
    const count = document.createElement('div');
    count.className = 'sec-nav-count'; count.setAttribute('aria-hidden', 'true');
    count.innerHTML = '<b>01</b><small>/ ' + pad2(navSections.length) + '</small>';
    const rail = document.createElement('div');
    rail.className = 'sec-nav-rail'; rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<div class="sec-nav-fill"></div><span class="sec-nav-dot"></span>';
    secNav.append(count, rail);
    navSections.forEach(sec => {
      const a = document.createElement('a');
      a.href = '#' + sec.id;
      a.setAttribute('aria-label', sec.dataset.nav);
      a.innerHTML = '<i></i>';
      a._sec = sec;
      secNav.appendChild(a);
    });
    const links = [...secNav.querySelectorAll('a')];
    const countNum = count.firstChild;
    const layoutRail = () => {
      const f = links[0], l = links[links.length - 1];
      if (!f) return;
      const y0 = f.offsetTop + f.offsetHeight / 2;
      rail.style.setProperty('--y0', y0 + 'px');
      rail.style.setProperty('--yh', (l.offsetTop + l.offsetHeight / 2 - y0) + 'px');
    };
    const showTip = (a) => {
      const i = links.indexOf(a);
      secTip.innerHTML = '<em></em><b></b><small></small>';
      secTip.children[0].textContent = pad2(i + 1) + ' / ' + pad2(links.length);
      secTip.children[1].textContent = a._sec.dataset.nav;
      secTip.children[2].textContent = a._sec.dataset.navDesc || '';
      const r = a.getBoundingClientRect();
      const h = secTip.offsetHeight;
      const top = Math.max(12, Math.min(window.innerHeight - h - 12, r.top + r.height / 2 - h / 2));
      secTip.style.top = top + 'px';
      secTip.style.setProperty('--tick-y', (r.top + r.height / 2 - top) + 'px');
      secTip.classList.add('is-on');
    };
    const hideTip = () => secTip.classList.remove('is-on');
    links.forEach(a => {
      a.addEventListener('mouseenter', () => showTip(a));
      a.addEventListener('focus', () => showTip(a));
      a.addEventListener('mouseleave', hideTip);
      a.addEventListener('blur', hideTip);
    });
    /* dock: ขีดที่อยู่ใกล้เมาส์ยืดยาวขึ้นตามระยะ */
    if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      secNav.addEventListener('pointermove', (e) => {
        links.forEach(a => {
          const r = a.getBoundingClientRect();
          const d = Math.abs(e.clientY - (r.top + r.height / 2));
          const k = Math.exp(-Math.pow(d / 28, 2));
          a.firstChild.style.setProperty('--w', (6 + 8 * k).toFixed(1) + 'px');
        });
      });
      secNav.addEventListener('pointerleave', () => links.forEach(a => a.firstChild.style.removeProperty('--w')));
    }
    let curIdx = -1;
    const markActive = () => {
      const marker = window.scrollY + window.innerHeight * 0.4;
      const tops = navSections.map(s => s.getBoundingClientRect().top + window.scrollY);
      let idx = 0;
      tops.forEach((tp, i) => { if (tp <= marker) idx = i; });
      /* ความคืบหน้าต่อเนื่องระหว่าง section (0..1 ตลอดความยาวเส้น) */
      const next = tops[idx + 1];
      const frac = next === undefined ? 0 : Math.max(0, Math.min(1, (marker - tops[idx]) / (next - tops[idx])));
      const pr = links.length > 1 ? (idx + frac) / (links.length - 1) : 0;
      rail.style.setProperty('--pr', Math.max(0, Math.min(1, pr)).toFixed(4));
      if (idx !== curIdx) {
        curIdx = idx;
        links.forEach((a, k) => {
          a.classList.toggle('is-active', k === idx);
          a.classList.toggle('is-past', k < idx);
          if (k === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
        countNum.textContent = pad2(idx + 1);
        countNum.classList.remove('is-tick'); void countNum.offsetWidth; countNum.classList.add('is-tick');
      }
    };
    let navRaf = 0;
    document.addEventListener('scroll', () => { if (!navRaf) navRaf = requestAnimationFrame(() => { navRaf = 0; markActive(); }); }, { passive: true });
    window.addEventListener('resize', () => { layoutRail(); markActive(); });
    layoutRail();
    markActive();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutRail(); markActive(); });
  }

  /* ESG — แถบการ์ดเลื่อน (E · S · G รวมกัน) พร้อมปุ่ม/ตัวนับ
     จอ ≥576px: เลื่อนแนวนอน · จอ ≤575px: สไลด์แบบเฟดทีละใบ */
  const esgTrack = document.querySelector('.esg .esg-track');
  if (esgTrack) {
    const esgSection = esgTrack.closest('.esg');
    const cards = [...esgTrack.children];
    const cnt = esgSection.querySelector('[data-esg-count]');
    const prevBtn = esgSection.querySelector('[data-esg-prev]');
    const nextBtn = esgSection.querySelector('[data-esg-next]');
    const fadeMq = window.matchMedia('(max-width: 575.98px)');
    const behavior = reduceMotion ? 'auto' : 'smooth';
    const step = () => (cards[0] ? cards[0].getBoundingClientRect().width : 300) + 14;
    let fadeIdx = 0;

    const setNav = (idx, pages) => {
      if (cnt) cnt.textContent = String(idx + 1).padStart(2, '0') + '/' + String(pages).padStart(2, '0');
      if (prevBtn) prevBtn.disabled = idx <= 0;
      if (nextBtn) nextBtn.disabled = idx >= pages - 1;
    };
    const showFade = (i) => {
      fadeIdx = Math.max(0, Math.min(cards.length - 1, i));
      cards.forEach((c, k) => { c.classList.toggle('is-active', k === fadeIdx); c.setAttribute('aria-hidden', k === fadeIdx ? 'false' : 'true'); c.tabIndex = k === fadeIdx ? 0 : -1; });
      setNav(fadeIdx, cards.length);
    };
    const syncScroll = () => {
      const max = esgTrack.scrollWidth - esgTrack.clientWidth;
      const pages = max > 4 ? Math.max(2, Math.round(max / step()) + 1) : 1;
      const idx = max > 4 ? (esgTrack.scrollLeft >= max - 4 ? pages - 1 : Math.min(pages - 1, Math.round(esgTrack.scrollLeft / step()))) : 0;
      setNav(idx, pages);
    };
    const sync = () => {
      if (fadeMq.matches) { esgTrack.classList.add('is-fade'); showFade(fadeIdx); }
      else {
        esgTrack.classList.remove('is-fade');
        cards.forEach(c => { c.classList.remove('is-active'); c.removeAttribute('aria-hidden'); c.removeAttribute('tabindex'); });
        syncScroll();
      }
    };
    prevBtn?.addEventListener('click', () => { fadeMq.matches ? showFade(fadeIdx - 1) : esgTrack.scrollBy({ left: -step(), behavior }); });
    nextBtn?.addEventListener('click', () => { fadeMq.matches ? showFade(fadeIdx + 1) : esgTrack.scrollBy({ left: step(), behavior }); });
    esgTrack.addEventListener('scroll', () => { if (!fadeMq.matches) syncScroll(); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ความสูง navbar จริง → ให้วิดีโอ hero (มือถือ) เริ่มชิดเส้นล่าง navbar พอดี */
  const navEl = document.querySelector('.rpcg-nav');
  if (navEl) {
    const setNavH = () => document.documentElement.style.setProperty('--nav-h', navEl.offsetHeight + 'px');
    setNavH();
    window.addEventListener('resize', setNavH);
    if (window.ResizeObserver) new ResizeObserver(setNavH).observe(navEl);
  }

  /* Hero video: แสดงรูป poster ก่อน แล้วค่อยโหลดวิดีโอหลังหน้าโหลดรูปเสร็จ (window load)
     → วิดีโอ (2–4.5 MB) ไม่แย่งเน็ตกับรูปในหน้า · ไฟล์ตามจอ: <source data-src media="…">
     ถ้าผู้ใช้ลดการเคลื่อนไหว/ประหยัดข้อมูล → ไม่โหลดวิดีโอเลย แสดงรูป poster แทน */
  const heroVid = document.querySelector('.hero-media video');
  if (heroVid) {
    const conn = navigator.connection || {};
    const skip = matchMedia('(prefers-reduced-motion: reduce)').matches || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    if (skip) heroVid.removeAttribute('autoplay');
    else {
      const start = () => {
        heroVid.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; s.removeAttribute('data-src'); });
        heroVid.preload = 'auto'; heroVid.load();
        const p = heroVid.play(); if (p && p.catch) p.catch(() => {});
      };
      const later = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200));
      if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
    }
  }

  /* Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear() + 543;

});

/* ---------- Cookie consent: แถบลอยด้านล่างจอ มีปุ่ม "ยอมรับ" ปุ่มเดียว (markup ใน partials/footer*.html)
   บันทึกที่ localStorage 'rpcg-consent' = { necessary:true, ts } · ส่ง event 'rpcg:consent' ให้สคริปต์อื่นฟังได้ */
(() => {
  const box = document.getElementById('cookieConsent');
  if (!box) return;
  const KEY = 'rpcg-consent';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* โหมดส่วนตัว: ใช้ได้เฉพาะหน้านี้ */ } };
  const open = () => {
    box.hidden = false;
    box.classList.remove('is-out');
    document.body.classList.add('ck-open');
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-in')));
  };
  const close = () => {
    box.classList.remove('is-in');
    box.classList.add('is-out');
    document.body.classList.remove('ck-open');
    setTimeout(() => { box.hidden = true; box.classList.remove('is-out'); }, reduce ? 0 : 460);
  };
  box.addEventListener('click', (e) => {
    if (!e.target.closest('[data-ck="accept"]')) return;
    const v = { necessary: true, ts: new Date().toISOString() };
    write(v);
    document.dispatchEvent(new CustomEvent('rpcg:consent', { detail: v }));
    close();
  });
  if (!read()) setTimeout(open, reduce ? 0 : 1200);
})();
