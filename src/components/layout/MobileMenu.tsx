"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { MOBILE_NAV_ITEMS } from "./nav-items";
import { scrollToId, setScrollLocked } from "./SmoothScroll";
import { profile, socialLinks, primaryContactHref } from "@/data/profile";
import { useOccludeScene } from "@/lib/scene-visibility";
import { cn } from "@/lib/utils";

/**
 * The small-screen navigation: a full-screen index rather than a shrunken
 * version of the desktop pill.
 *
 * Three things here are specifically about being on a phone:
 *
 *  · The list is the complete index in page order (see `nav-items.ts`), and it
 *    scrolls — seven entries at `display-lg` do not fit a 390px-tall landscape
 *    phone, and a menu you cannot reach the bottom of is worse than no menu.
 *  · The section you are currently in is marked, because there is no
 *    persistent bar behind the overlay to tell you.
 *  · The primary contact control lives here. It is hidden from the bar below
 *    `sm`, so without it the narrowest phones have no contact affordance in
 *    the navigation at all.
 */
export function MobileMenu({
  open,
  onClose,
  active,
}: {
  open: boolean;
  onClose: () => void;
  /** Id of the section currently owning the viewport. */
  active?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // A full-screen opaque overlay: nothing of the scene is visible behind it.
  useOccludeScene(open, "mobile-menu");

  /* Scroll lock + focus management + Escape ------------------------------- */
  useEffect(() => {
    if (!open) return;
    setScrollLocked(true, "mobile-menu");

    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false, "mobile-menu");
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
          { yPercent: 0, duration: 0.9, ease: EASE.type, stagger: 0.05 },
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

  const contactIsMail = primaryContactHref.startsWith("mailto:");

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="fixed inset-0 z-[120] flex flex-col bg-[rgba(3,4,7,0.96)] pt-[var(--safe-t)] pb-[var(--safe-b)] backdrop-blur-xl lg:hidden"
    >
      <div className="shell flex shrink-0 items-center justify-between pt-4">
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

      {/* `min-h-0` is what actually lets this flex child scroll instead of
          pushing the footer off the bottom of a short landscape screen. */}
      <nav className="shell flex min-h-0 flex-1 flex-col justify-center gap-0.5 overflow-y-auto overscroll-contain py-6">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <span key={item.id} className="clip-line shrink-0">
              <button
                className="js-menu-item flex w-full items-baseline gap-5 py-2 text-left"
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  onClose();
                  // Let the overlay unmount before scrolling.
                  requestAnimationFrame(() => scrollToId(item.id));
                }}
              >
                <span
                  className={cn(
                    "label w-8 shrink-0 transition-colors duration-500",
                    isActive && "text-[var(--color-cyan)]",
                  )}
                >
                  {item.index}
                </span>
                <span
                  className={cn(
                    "display-lg transition-colors duration-500",
                    isActive
                      ? "text-[var(--color-ink)]"
                      : "text-[rgba(244,246,255,0.62)]",
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span
                    aria-hidden
                    className="ml-auto h-1.5 w-1.5 shrink-0 self-center rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_var(--color-cyan)]"
                  />
                )}
              </button>
            </span>
          );
        })}
      </nav>

      <div className="js-menu-foot shell flex shrink-0 flex-col gap-6 pt-4 pb-8">
        <a
          href={primaryContactHref}
          {...(contactIsMail
            ? {}
            : { target: "_blank", rel: "noopener noreferrer" })}
          className="flex min-h-[56px] items-center justify-between gap-4 rounded-full border border-[color-mix(in_oklab,var(--color-cyan)_26%,transparent)] bg-[rgba(108,243,255,0.05)] px-7"
        >
          <span className="font-mono text-[0.72rem] tracking-[0.2em] text-[var(--color-ink)]">
            {profile.contact.ctaLabel}
          </span>
          <span className="text-[var(--color-cyan)]">↗</span>
        </a>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="label label-bright inline-flex min-h-[44px] items-center"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
