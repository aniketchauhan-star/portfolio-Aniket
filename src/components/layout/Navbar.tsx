"use client";

import { useEffect, useState } from "react";
import { profile, primaryContactHref } from "@/data/profile";
import { NAV_ITEMS, MOBILE_NAV_ITEMS } from "./nav-items";
import { scrollToId, scrollToTop } from "./SmoothScroll";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

/**
 * Fixed glass navigation. A thin floating pill on desktop; a compact bar with
 * a full-screen overlay menu below `lg`. It gains opacity — never height —
 * once the visitor leaves the hero, so nothing on the page shifts.
 */
export function Navbar() {
  const [condensed, setCondensed] = useState(false);
  const [active, setActive] = useState<string>("top");
  const [menuOpen, setMenuOpen] = useState(false);

  // `primaryContactHref` is an email when one is set, otherwise LinkedIn —
  // only the latter should open in a new tab.
  const contactIsMail = primaryContactHref.startsWith("mailto:");

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Reflect the section currently owning the viewport.
     Watches the union of both menus, not just the desktop four — the mobile
     overlay marks the current section and carries every section on the page. */
  useEffect(() => {
    const ids = Array.from(
      new Set([...NAV_ITEMS, ...MOBILE_NAV_ITEMS].map((i) => i.id)),
    );
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* The page draws under the Dynamic Island / notch, so the bar pads
          itself below it rather than sitting behind it. */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] pt-[var(--safe-t)] transition-colors duration-700",
        )}
      >
        <div className="shell flex items-center justify-between py-3 lg:py-5">
          {/* Monogram --------------------------------------------------- */}
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            data-cursor="link"
            className={cn(
              "group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-700",
              condensed ? "glass" : "border border-transparent",
            )}
          >
            <span className="font-display text-[0.9rem] leading-none tracking-tight">
              {profile.monogram}
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 glow-cyan" />
          </button>

          {/* Desktop links ---------------------------------------------- */}
          <nav
            aria-label="Primary"
            className={cn(
              "hidden items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-700 lg:flex",
              condensed
                ? "glass bg-[rgba(255,255,255,0.045)]"
                : "border border-[var(--color-line-soft)] bg-[rgba(255,255,255,0.012)] backdrop-blur-md",
            )}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                data-cursor="link"
                aria-current={active === item.id ? "true" : undefined}
                className="group relative overflow-hidden rounded-full px-4 py-2"
              >
                <span className="label relative z-10 flex items-center gap-2 transition-colors duration-400 group-hover:text-[var(--color-ink)]">
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full transition-all duration-500",
                      active === item.id
                        ? "bg-[var(--color-cyan)] opacity-100"
                        : "bg-[var(--color-cyan)] opacity-0 group-hover:opacity-70",
                    )}
                  />
                  <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[3px]">
                    {item.label}
                  </span>
                </span>
              </button>
            ))}
          </nav>

          {/* Contact + mobile trigger ------------------------------------ */}
          <div className="flex items-center gap-3">
            <a
              href={primaryContactHref}
              {...(contactIsMail
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              data-cursor="link"
              className={cn(
                "group hidden min-h-[44px] items-center gap-2 rounded-full px-5 transition-all duration-700 sm:flex",
                condensed
                  ? "glass"
                  : "border border-[var(--color-line-soft)] backdrop-blur-md",
              )}
            >
              <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
                CONTACT
              </span>
              <span className="text-[var(--color-cyan)] text-xs transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45">
                ↗
              </span>
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="glass flex h-11 items-center gap-2.5 rounded-full pr-4 pl-3.5 lg:hidden"
            >
              <span aria-hidden className="flex flex-col gap-[3px]">
                <span className="block h-px w-3.5 bg-[var(--color-ink)]" />
                <span className="block h-px w-3.5 bg-[var(--color-ink)]" />
              </span>
              <span className="label label-bright">MENU</span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={active}
      />
    </>
  );
}
