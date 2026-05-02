'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on pointer-capable (non-touch) devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf: number;
    let hoverCount = 0;

    const LERP = 0.11;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.current!.style.left = `${mx}px`;
      dot.current!.style.top  = `${my}px`;
    };

    const setHover = (on: boolean) => {
      hoverCount += on ? 1 : -1;
      const active = hoverCount > 0;
      ring.current?.classList.toggle('cur-hover', active);
      dot.current?.classList.toggle('cur-hover', active);
    };

    const onClick = () => {
      ring.current?.classList.add('cur-click');
      dot.current?.classList.add('cur-click');
      setTimeout(() => {
        ring.current?.classList.remove('cur-click');
        dot.current?.classList.remove('cur-click');
      }, 180);
    };

    const watchTargets = () => {
      document.querySelectorAll('a, button, [role="button"], label, input[type="submit"], [data-hover]')
        .forEach(el => {
          const e = el as HTMLElement;
          if (e.dataset.cursorBound) return;
          e.dataset.cursorBound = '1';
          e.addEventListener('mouseenter', () => setHover(true));
          e.addEventListener('mouseleave', () => setHover(false));
        });
    };

    const loop = () => {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      ring.current!.style.left = `${rx}px`;
      ring.current!.style.top  = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };

    loop();
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('click', onClick);
    watchTargets();
    const iv = setInterval(watchTargets, 1200);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      <div ref={dot}  className="cur-dot"  aria-hidden />
      <div ref={ring} className="cur-ring" aria-hidden />
    </>
  );
}
