document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Preloader */
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    setTimeout(() => pre && pre.classList.add('hide'), 500);
  });

  /* Hero title line-by-line reveal */
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    if (reduceMotion) heroTitle.classList.add('in');
    else setTimeout(() => heroTitle.classList.add('in'), 650);
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
    const keys = [...bizShow.querySelectorAll('.biz-thumb')].map(t => t.dataset.biz);
    const bizCount = document.getElementById('bizCount');
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
    };
    const startBizAutoplay = () => {
      clearInterval(bizTimer);
      if (!reduceMotion) bizTimer = setInterval(() => setBizActive(bizIndex + 1), 7000);
    };
    bizShow.querySelectorAll('.biz-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => { setBizActive(keys.indexOf(thumb.dataset.biz)); startBizAutoplay(); });
    });
    document.getElementById('bizPrev')?.addEventListener('click', () => { setBizActive(bizIndex - 1); startBizAutoplay(); });
    document.getElementById('bizNext')?.addEventListener('click', () => { setBizActive(bizIndex + 1); startBizAutoplay(); });
    startBizAutoplay();
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
  initWordReveal(document.getElementById('bizGridHeading'));

  /* Navbar scroll state */
  const nav = document.querySelector('.rpcg-nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    const backTop = document.querySelector('.back-top');
    if (window.scrollY > 700) backTop.classList.add('show');
    else backTop.classList.remove('show');
  };
  document.addEventListener('scroll', onScroll);
  onScroll();

  /* Collapse mobile nav on link click */
  document.querySelectorAll('.rpcg-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.querySelector('.navbar-collapse.show');
      if (collapse) bootstrap.Collapse.getOrCreateInstance(collapse).hide();
    });
  });

  /* Site mega-menu — light dropdown card below the navbar */
  const irOc = document.getElementById('irOffcanvas');
  const irVeil = document.getElementById('irOffcanvasVeil');
  const irTrigger = document.getElementById('irOffcanvasTrigger');
  if (irOc && irTrigger) {
    const irClose = document.getElementById('irOffcanvasClose');

    const openIr = () => {
      irOc.classList.add('is-open');
      irOc.setAttribute('aria-hidden', 'false');
      if (irVeil) irVeil.classList.add('is-open');
      document.body.classList.add('ir-oc-open');
      const mobileCollapse = document.querySelector('.navbar-collapse.show');
      if (mobileCollapse) bootstrap.Collapse.getOrCreateInstance(mobileCollapse).hide();
      setTimeout(() => irClose.focus(), reduceMotion ? 0 : 350);
    };
    const closeIr = () => {
      irOc.classList.remove('is-open');
      irOc.setAttribute('aria-hidden', 'true');
      if (irVeil) irVeil.classList.remove('is-open');
      document.body.classList.remove('ir-oc-open');
      irTrigger.focus();
    };

    /* stopPropagation, not just preventDefault — otherwise this click still
       bubbles to the document-level hash-link handler below, which sees the
       same href="#investor" and smooth-scrolls the page to it underneath
       the dropdown. */
    irTrigger.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openIr(); });
    irClose.addEventListener('click', closeIr);
    const sideMenuTab = document.getElementById('sideMenuTab');
    if (sideMenuTab) sideMenuTab.addEventListener('click', openIr);
    if (irVeil) irVeil.addEventListener('click', closeIr);
    irOc.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', closeIr));

    /* IR info master-detail: click a left-hand tab to swap the right-hand panel */
    const irTabs = irOc.querySelectorAll('.ir-oc-ir-tab');
    irTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.irTab;
        irTabs.forEach(t => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });
        irOc.querySelectorAll('.ir-oc-ir-panel').forEach(panel => {
          panel.classList.toggle('is-active', panel.dataset.irPanel === key);
        });
      });
    });

    irOc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeIr(); return; }
      if (e.key !== 'Tab') return;
      const focusables = Array.from(irOc.querySelectorAll('a[href], button:not([disabled])')).filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

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

  /* Scroll-spy active link */
  const sections = [...document.querySelectorAll('section[id], header[id]')];
  const navLinks = document.querySelectorAll('.rpcg-nav .nav-link');
  const updateActiveLink = () => {
    const marker = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= marker) current = s; });
    navLinks.forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.rpcg-nav .nav-link[href="#${current.id}"]`);
    if (active) active.classList.add('active');
  };
  document.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

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

  /* Magnetic buttons */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn-rpcg').forEach(btn => {
      btn.classList.add('btn-magnetic');
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.35;
        const y = (e.clientY - r.top - r.height / 2) * 0.5;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* Scroll parallax on section images */
  const parallaxEls = document.querySelectorAll('.pimg, [data-parallax]');
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

      /* Hero — CSS (see .hero) pins it with position:sticky so About can
         slide up and overtake it; here it also drifts upward on its own,
         at roughly a third of that cover-scroll's rate, so it still reads
         as moving (just laggier/slower), not static furniture underneath.
         #about is the trigger rather than .hero itself — .hero is sticky,
         and a sticky element makes an unreliable ScrollTrigger trigger. */
      const hero = document.querySelector('.hero');
      if (hero) {
        const heroCoverTrigger = () => ({ trigger: '#business', start: 'top bottom', end: 'top top', scrub: true });
        gsap.to(hero, { yPercent: -30, ease: 'none', scrollTrigger: heroCoverTrigger() });
        /* Blur stays ~0 through most of the cover-scroll and only ramps in
           near the end (power3.in), so Hero looks like it's racking out of
           focus as About finishes swallowing it — not blurry the whole way. */
        gsap.fromTo(hero,
          { filter: 'blur(0px)' },
          { filter: 'blur(14px)', ease: 'power3.in', scrollTrigger: heroCoverTrigger() });
      }

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
    document.querySelectorAll('.proj-card').forEach(card => {
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

  /* Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear() + 543;

});

/* Group map: clicking a business group opens the matching panel in the showcase below */
document.querySelectorAll('[data-biz-link]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector(`#bizShow .biz-thumb[data-biz="${link.dataset.bizLink}"]`)?.click();
  });
});

/* Group map nodes open the detail panel; collapses change page height, so refresh scroll triggers */
document.querySelectorAll('[data-biz-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const detail = document.getElementById('bizDetail');
    if (detail && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(detail, { toggle: false }).show();
    setTimeout(() => detail && detail.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  });
});
document.querySelectorAll('.collapse').forEach(c => {
  ['shown.bs.collapse', 'hidden.bs.collapse'].forEach(ev => c.addEventListener(ev, () => window.ScrollTrigger && ScrollTrigger.refresh()));
});
