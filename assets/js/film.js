/* ==========================================================================
   ภาพจำลองวิดีโอ hero 10 วินาที (แทนวิดีโอจริงชั่วคราว)
   อิงสคริปต์ "RPC Energy-Led Ecosystem": Establish → Reveal → Expand → Unify
   - [data-film="bg"]     พื้นหลัง hero: เล่นวนเงียบ ๆ ไม่มีข้อความ
   - [data-film="player"] เต็มจอ (#filmModal): มีข้อความ แถบ 4 ช่วง และหมายเหตุช็อตที่ต้องใช้ฟุตเทจจริง
   ภาพทั้งหมดเป็นภาพที่มีอยู่ในเดโม่ กล้องเคลื่อนจำลองด้วย scale / translate
   ========================================================================== */
(() => {
  const DURATION = 10, FADE = 0.4;
  const IMG = 'assets/img/';
  /* s = scale, x / y = เลื่อนเป็น % ของเฟรม, o = จุดศูนย์กลางการซูม */
  const SHOTS = [
    { src: 'CALTEX-0221-1536x1024.webp', start: 0, end: 2.2, o: '50% 40%', from: { s: 1, x: 0, y: 0 }, to: { s: 1.12, x: 0, y: -1 } },
    { src: 'CALTEX-0221-1536x1024.webp', start: 2, end: 3.2, o: '58% 18%', from: { s: 1.55, x: 0, y: 0 }, to: { s: 1.75, x: -2, y: 0 } },
    { src: 'film/caltex-service.webp', start: 3, end: 4.3, o: '55% 45%', from: { s: 1.04, x: 0, y: 0 }, to: { s: 1.14, x: -1.5, y: 0 } },
    { src: 'hero-poster.webp', start: 4.1, end: 5.7, o: '50% 50%', from: { s: 1.12, x: 2, y: 0 }, to: { s: 1.12, x: -3, y: 0 } },
    { src: 'film/samco-gate.webp', start: 5.5, end: 7.3, o: '60% 50%', from: { s: 1.02, x: 0, y: 0 }, to: { s: 1.12, x: 0, y: 0 } },
    { src: 'film/unify-aerial.webp', start: 7.1, end: 9.4, o: '35% 60%', from: { s: 1.2, x: 0, y: 0 }, to: { s: 1, x: 0, y: 0 } },
  ];
  const INSET = { start: 4.1, end: 7.1 };   /* กรอบสถานีบริการค้างไว้ช่วง Expand: พลังงานยังอยู่ในเรื่อง */
  const LOCKUP = 9.2;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const fadeIn = (t, a, b) => Math.max(0, Math.min(1, (t - a) / FADE, (b - t) / FADE));

  function build(root) {
    const player = root.dataset.film === 'player';
    root.innerHTML = '';
    const layers = SHOTS.map(shot => {
      const img = new Image();
      img.src = IMG + shot.src; img.alt = ''; img.decoding = 'async';
      img.className = 'rpc-film-shot'; img.style.transformOrigin = shot.o;
      root.append(img);
      return { shot, img };
    });
    const ui = {};
    if (player) {
      ui.inset = Object.assign(document.createElement('div'), { className: 'rpc-film-inset', innerHTML: `<img src="${IMG}CALTEX-0221-1536x1024.webp" alt=""><span>Energy core</span>` });
      ui.lockup = Object.assign(document.createElement('div'), { className: 'rpc-film-lockup', innerHTML: `<img src="${IMG}rpcg-outline.svg" alt=""><b>RPC</b>` });
      root.append(ui.inset, ui.lockup);
    } else {
      ui.lockup = Object.assign(document.createElement('div'), { className: 'rpc-film-lockup is-bg' });
      root.append(ui.lockup);
    }
    return { root, player, layers, ui };
  }

  function render(film, t) {
    film.layers.forEach(({ shot, img }) => {
      const a = fadeIn(t, shot.start, shot.end);
      img.style.opacity = a.toFixed(3);
      if (!a) return;
      const p = ease(Math.max(0, Math.min(1, (t - shot.start) / (shot.end - shot.start))));
      const s = lerp(shot.from.s, shot.to.s, p), x = lerp(shot.from.x, shot.to.x, p), y = lerp(shot.from.y, shot.to.y, p);
      img.style.transform = `translate(${x}%, ${y}%) scale(${s.toFixed(4)})`;
    });
    film.ui.lockup.style.opacity = Math.max(0, Math.min(1, (t - LOCKUP) / 0.35)).toFixed(3);
    if (film.ui.inset) film.ui.inset.style.opacity = fadeIn(t, INSET.start, INSET.end).toFixed(3);
  }

  /* ---- hero background ---- */
  const bgRoot = document.querySelector('[data-film="bg"]');
  const bg = bgRoot && build(bgRoot);
  let bgStart = performance.now();
  if (bg) {
    if (reduceMotion) render(bg, 1);
    else {
      const loop = now => { render(bg, ((now - bgStart) / 1000) % DURATION); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

})();
