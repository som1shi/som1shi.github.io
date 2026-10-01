import React, { useEffect, useRef } from 'react';

// Frosted colour + magnetic dots: soft colour pools drift under matte glass (one follows the cursor),
// and a crisp dot grid on top swells and turns to white light around the cursor; clicks send a ripple.

// 3D simplex noise (Stefan Gustavson, public domain), used for the slow drift of the colour pools
const makeNoise = () => {
  const g = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
  const p = new Uint8Array(512);
  const base = Array.from({ length: 256 }, (_, i) => i);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i += 1) p[i] = base[i & 255];
  const F3 = 1 / 3;
  const G3 = 1 / 6;
  return (x, y, z) => {
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x0 = x - i + t;
    const y0 = y - j + t;
    const z0 = z - k + t;
    let o;
    if (x0 >= y0) o = y0 >= z0 ? [1, 0, 0, 1, 1, 0] : x0 >= z0 ? [1, 0, 0, 1, 0, 1] : [0, 0, 1, 1, 0, 1];
    else o = y0 < z0 ? [0, 0, 1, 0, 1, 1] : x0 < z0 ? [0, 1, 0, 0, 1, 1] : [0, 1, 0, 1, 1, 0];
    const corners = [
      [x0, y0, z0, 0, 0, 0],
      [x0 - o[0] + G3, y0 - o[1] + G3, z0 - o[2] + G3, o[0], o[1], o[2]],
      [x0 - o[3] + 2 * G3, y0 - o[4] + 2 * G3, z0 - o[5] + 2 * G3, o[3], o[4], o[5]],
      [x0 - 1 + 3 * G3, y0 - 1 + 3 * G3, z0 - 1 + 3 * G3, 1, 1, 1],
    ];
    let n = 0;
    corners.forEach(([cx, cy, cz, a, b, d]) => {
      let tt = 0.6 - cx * cx - cy * cy - cz * cz;
      if (tt < 0) return;
      const gi = p[(i & 255) + a + p[(j & 255) + b + p[(k & 255) + d]]] % 12;
      tt *= tt;
      n += tt * tt * (g[gi][0] * cx + g[gi][1] * cy + g[gi][2] * cz);
    });
    return 32 * n;
  };
};

const POOLS = [
  { c: '255,170,150', r: 0.42, x: 0.25, y: 0.3 },
  { c: '160,180,255', r: 0.48, x: 0.75, y: 0.35 },
  { c: '255,215,140', r: 0.36, x: 0.55, y: 0.8 },
  { c: '190,160,240', r: 0.4, x: 0.15, y: 0.85 },
];
const GAP = 22;
const REACH = 140;
const FROST_SCALE = 0.25; // the colour layer is blurred anyway, so it renders at quarter resolution

const DesktopWallpaper = () => {
  const frostRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    const frost = frostRef.current;
    const dots = dotsRef.current;
    const fctx = frost.getContext('2d');
    const dctx = dots.getContext('2d');
    const noise = makeNoise();
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, sx: window.innerWidth / 2, sy: window.innerHeight / 2, active: false };
    const follow = { x: mouse.x, y: mouse.y };
    const ripples = [];
    let W = 0;
    let H = 0;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      dots.width = W * dpr;
      dots.height = H * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frost.width = Math.ceil(W * FROST_SCALE);
      frost.height = Math.ceil(H * FROST_SCALE);
      fctx.setTransform(FROST_SCALE, 0, 0, FROST_SCALE, 0, 0);
    };

    const drawFrost = (time) => {
      const t = time * 0.00007;
      const m = Math.max(W, H);
      fctx.globalCompositeOperation = 'source-over';
      fctx.fillStyle = '#efeeea';
      fctx.fillRect(0, 0, W, H);
      fctx.globalCompositeOperation = 'multiply';
      POOLS.forEach((pool, i) => {
        const x = (pool.x + noise(i * 3.1, t, 0) * 0.12) * W;
        const y = (pool.y + noise(0, i * 2.7, t) * 0.12) * H;
        const g = fctx.createRadialGradient(x, y, 0, x, y, pool.r * m);
        g.addColorStop(0, `rgba(${pool.c},0.45)`);
        g.addColorStop(1, `rgba(${pool.c},0)`);
        fctx.fillStyle = g;
        fctx.fillRect(0, 0, W, H);
      });
      follow.x += (mouse.x - follow.x) * 0.05;
      follow.y += (mouse.y - follow.y) * 0.05;
      const g = fctx.createRadialGradient(follow.x, follow.y, 0, follow.x, follow.y, 0.22 * m);
      g.addColorStop(0, 'rgba(120,150,255,0.32)');
      g.addColorStop(0.5, 'rgba(240,140,200,0.12)');
      g.addColorStop(1, 'rgba(240,140,200,0)');
      fctx.fillStyle = g;
      fctx.fillRect(0, 0, W, H);
    };

    const drawDots = () => {
      dctx.clearRect(0, 0, W, H);
      for (let y = GAP / 2; y < H; y += GAP) {
        for (let x = GAP / 2; x < W; x += GAP) {
          const dx = x - mouse.sx;
          const dy = y - mouse.sy;
          const d = Math.hypot(dx, dy);
          let f = mouse.active ? Math.exp(-(d * d) / (REACH * REACH)) : 0;
          let px = x;
          let py = y;
          ripples.forEach((rp) => {
            const rd = Math.hypot(x - rp.x, y - rp.y);
            const w = Math.exp(-((rd - rp.t * 900) ** 2) / 1800) * Math.max(0, 1 - rp.t * 0.9);
            if (w > 0.01) {
              px += ((x - rp.x) / (rd || 1)) * w * 6;
              py += ((y - rp.y) / (rd || 1)) * w * 6;
              f = Math.max(f, w * 0.5);
            }
          });
          if (d > 0) {
            px += (dx / d) * f * 7;
            py += (dy / d) * f * 7;
          }
          dctx.fillStyle = f > 0.02 ? `rgba(255,255,255,${0.2 + f * 0.45})` : 'rgba(40,36,60,0.09)';
          dctx.beginPath();
          dctx.arc(px, py, 1 + f * 1.2, 0, Math.PI * 2);
          dctx.fill();
        }
      }
    };

    const tick = (time) => {
      const dt = Math.min(50, time - last);
      last = time;
      mouse.sx += (mouse.x - mouse.sx) * 0.12;
      mouse.sy += (mouse.y - mouse.sy) * 0.12;
      ripples.forEach((rp) => { rp.t += dt / 1000; });
      while (ripples.length && ripples[0].t > 1.3) ripples.shift();
      drawFrost(time);
      drawDots();
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    const onDown = (event) => {
      if (event.target.closest?.('input, textarea, select')) return;
      ripples.push({ x: event.clientX, y: event.clientY, t: 0 });
    };
    // stop drawing while the tab is hidden
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reduced) frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    if (reduced) {
      drawFrost(0);
      drawDots();
    } else {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      window.addEventListener('pointerdown', onDown, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="desktop-wallpaper desktop-wallpaper-frost" aria-hidden="true">
      <canvas ref={frostRef} className="wallpaper-frost" />
      <span className="wallpaper-veil" />
      <canvas ref={dotsRef} className="wallpaper-dots" />
    </div>
  );
};

export default DesktopWallpaper;
