"use client";

import { useEffect, useRef } from "react";

/**
 * Hairline document-progress indicator: top edge on small screens, right edge
 * from `md` up. Driven by a passive scroll listener writing one CSS custom
 * property — zero React re-renders.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <style>{`
        .sp-track{
          position:fixed; z-index:50; pointer-events:none;
          top:0; left:0; right:0; height:1px;
          background:rgba(244,246,255,0.055);
        }
        .sp-bar{
          display:block; width:100%; height:100%;
          transform-origin:left center;
          transform:scaleX(var(--p,0));
          background:linear-gradient(90deg,rgba(108,243,255,0.18),rgba(244,246,255,0.9));
        }
        @media (min-width:768px){
          .sp-track{ top:0; bottom:0; left:auto; right:0; width:1px; height:auto; }
          .sp-bar{
            transform-origin:top center;
            transform:scaleY(var(--p,0));
            background:linear-gradient(180deg,rgba(108,243,255,0.18),rgba(244,246,255,0.9));
          }
        }
      `}</style>
      <div aria-hidden className="sp-track">
        <span ref={bar} className="sp-bar" />
      </div>
    </>
  );
}
