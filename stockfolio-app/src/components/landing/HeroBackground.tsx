'use client';

import { useEffect, useRef } from 'react';

// ─── Aurora bands (rendered to a blurred canvas) ──────────────────────────
const BANDS = [
  { fy: 0.32, amp: 0.060, f1: 0.0030, f2: 0.0017, spd: 0.00050, rgb: [34, 211, 238],   a: 0.18, h: 0.22 },
  { fy: 0.50, amp: 0.075, f1: 0.0022, f2: 0.0013, spd: 0.00038, rgb: [167, 139, 250],  a: 0.14, h: 0.26 },
  { fy: 0.65, amp: 0.048, f1: 0.0038, f2: 0.0021, spd: 0.00065, rgb: [52, 211, 153],   a: 0.11, h: 0.20 },
  { fy: 0.22, amp: 0.032, f1: 0.0048, f2: 0.0026, spd: 0.00080, rgb: [34, 211, 238],   a: 0.08, h: 0.14 },
  { fy: 0.75, amp: 0.055, f1: 0.0018, f2: 0.0011, spd: 0.00032, rgb: [167, 139, 250],  a: 0.09, h: 0.17 },
  { fy: 0.42, amp: 0.042, f1: 0.0035, f2: 0.0020, spd: 0.00055, rgb: [52, 211, 153],   a: 0.07, h: 0.13 },
];

// ─── Floating particles (rendered to a sharp canvas) ─────────────────────
interface Pt { x: number; y: number; vy: number; r: number; a: number; rgb: [number,number,number] }

function makePt(w: number, h: number): Pt {
  const palettes: [number,number,number][] = [[34,211,238],[167,139,250],[52,211,153]];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vy: -(Math.random() * 0.22 + 0.07),
    r:  Math.random() * 1.3 + 0.5,
    a:  Math.random() * 0.4 + 0.15,
    rgb: palettes[Math.floor(Math.random() * palettes.length)],
  };
}

export default function HeroBackground() {
  const auroraRef   = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<HTMLCanvasElement>(null);

  // ── Aurora ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = auroraRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number, t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const b of BANDS) {
        const cy   = b.fy * canvas.height;
        const halfH = b.h * canvas.height;
        const [R, G, Bl] = b.rgb;

        const grd = ctx.createLinearGradient(0, cy - halfH * 1.6, 0, cy + halfH * 1.6);
        grd.addColorStop(0,    `rgba(${R},${G},${Bl},0)`);
        grd.addColorStop(0.35, `rgba(${R},${G},${Bl},${b.a * 0.55})`);
        grd.addColorStop(0.5,  `rgba(${R},${G},${Bl},${b.a})`);
        grd.addColorStop(0.65, `rgba(${R},${G},${Bl},${b.a * 0.55})`);
        grd.addColorStop(1,    `rgba(${R},${G},${Bl},0)`);

        ctx.beginPath();
        const step = 5;
        // Top wave edge
        ctx.moveTo(0, cy - halfH);
        for (let x = 0; x <= canvas.width; x += step) {
          const y = cy
            + Math.sin(x * b.f1 + t * b.spd)       * b.amp * canvas.height
            + Math.sin(x * b.f2 + t * b.spd * 1.5) * b.amp * 0.4 * canvas.height;
          ctx.lineTo(x, y - halfH * 0.5);
        }
        // Bottom: straight line well below
        ctx.lineTo(canvas.width, cy + halfH * 1.2);
        ctx.lineTo(0, cy + halfH * 1.2);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── Particles ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = window.innerWidth < 768 ? 30 : 55;
    const pts: Pt[] = Array.from({ length: COUNT }, () => makePt(canvas.width, canvas.height));
    const MAX_LINK = 120;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.y += p.vy;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }

        const [R, G, Bl] = p.rgb;

        // Soft glow halo
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, `rgba(${R},${G},${Bl},${p.a * 0.6})`);
        g.addColorStop(1, `rgba(${R},${G},${Bl},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R},${G},${Bl},${p.a})`;
        ctx.fill();

        // Connection lines
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_LINK) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(34,211,238,${(1 - d / MAX_LINK) * 0.045})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <>
      {/* Aurora — blurred soft layer */}
      <canvas
        ref={auroraRef}
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ filter: 'blur(55px)', opacity: 0.85 }}
      />
      {/* Particles — sharp crisp layer */}
      <canvas
        ref={particleRef}
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        style={{ opacity: 0.65 }}
      />
    </>
  );
}
