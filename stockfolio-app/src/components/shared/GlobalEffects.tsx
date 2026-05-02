'use client';

import { useEffect, useRef } from 'react';

// ─── Scroll progress bar ──────────────────────────────────────────────────
function ScrollBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight) || 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${scrolled})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[99999] origin-left"
      style={{
        background: 'linear-gradient(90deg, #22d3ee, #34d399, #a78bfa)',
        transform: 'scaleX(0)',
        transition: 'transform 0.1s linear',
      }}
    />
  );
}

// ─── Click ripple ─────────────────────────────────────────────────────────
function RippleEffect() {
  useEffect(() => {
    const spawn = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest(
        'button:not(:disabled), a, [role="button"], .ripple-host'
      ) as HTMLElement | null;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top  - size / 2;

      const r = document.createElement('span');
      r.className = 'ripple-wave';
      r.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;

      const prev = btn.style.cssText;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(r);
      r.addEventListener('animationend', () => {
        r.remove();
        btn.style.cssText = prev;
      }, { once: true });
    };

    document.addEventListener('click', spawn);
    return () => document.removeEventListener('click', spawn);
  }, []);

  return null;
}

// ─── Scroll reveal (Intersection Observer) ───────────────────────────────
function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('sr-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const watch = () => {
      document.querySelectorAll('.sr').forEach(el => {
        if (!(el as HTMLElement).classList.contains('sr-visible')) io.observe(el);
      });
    };

    watch();
    // Re-scan every second for dynamically added elements
    const iv = setInterval(watch, 1000);
    return () => { io.disconnect(); clearInterval(iv); };
  }, []);

  return null;
}

export default function GlobalEffects() {
  return (
    <>
      <ScrollBar />
      <RippleEffect />
      <ScrollReveal />
    </>
  );
}
