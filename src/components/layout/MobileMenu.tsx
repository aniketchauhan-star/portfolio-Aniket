"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { MOBILE_NAV_ITEMS } from "./nav-items";
import { scrollToId, setScrollLocked } from "./SmoothScroll";
import { profile, socialLinks } from "@/data/profile";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  /* Scroll lock + focus management + Escape ------------------------------- */
  useEffect(() => {
    setScrollLocked(open);
    if (!open) return;

    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [open, onClose]);

  /* Reveal ---------------------------------------------------------------- */
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      if (!open) return;
      const items = gsap.utils.toArray<HTMLElement>(".js-menu-item", el);
      gsap
        .timeline()
        .fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: EASE.inOut },
        )
        .fromTo(
          items,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, ease: EASE.type, stagger: 0.06 },
          "-=0.35",
        )
        .fromTo(
          ".js-menu-foot",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.4",
        );
    }, root);

    return () => ctx.revert();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-[120] flex flex-col bg-[rgba(3,4,7,0.94)] backdrop-blur-xl lg:hidden"
    >
      <div className="shell flex items-center justify-between pt-6">
        <span className="font-display text-lg tracking-tight">
          {profile.monogram}
        </span>
        <button
          ref={closeBtn}
          onClick={onClose}
          aria-label="Close menu"
          className="edge flex h-11 w-11 items-center justify-center rounded-full"
        >
          <X size={16} strokeWidth={1.4} />
        </button>
      </div>

      <nav className="shell flex flex-1 flex-col justify-center gap-1">
        {MOBILE_NAV_ITEMS.map((item) => (
          <span key={item.id} className="clip-line">
            <button
              className="js-menu-item flex w-full items-baseline gap-5 py-2 text-left"
              onClick={() => {
                onClose();
                // Let the overlay unmount before scrolling.
                requestAnimationFrame(() => scrollToId(item.id));
              }}
            >
              <span className="label w-8 shrink-0">{item.index}</span>
              <span className="display-lg">{item.label}</span>
            </button>
          </span>
        ))}
      </nav>

      <div className="js-menu-foot shell flex flex-wrap items-center gap-x-6 gap-y-2 pb-10">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="label label-bright"
            {...(link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
