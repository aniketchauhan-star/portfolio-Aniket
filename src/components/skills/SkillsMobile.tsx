"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SkillGroup } from "@/data/profile";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { cn, pad2 } from "@/lib/utils";
import { OrbitPlanet } from "./OrbitPlanet";

/**
 * The small-screen reading of the capability system: the same glass language
 * and the same data, laid out as a horizontally scrollable rail instead of an
 * orbit. Not a shrunken desktop layout — a layout designed for the thumb.
 *
 * The rail carries its own position readout. A horizontal scroller inside a
 * vertical page is the one component on a phone that can be missed entirely:
 * with the cards clipped at the screen edge and nothing else on screen to say
 * otherwise, three of five disciplines simply never get read. The counter and
 * the markers below say how many there are, which one you are on, and — being
 * tappable — offer a way through the rail that is not a swipe.
 */
export function SkillsMobile({ groups }: { groups: SkillGroup[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Which card owns the rail right now ------------------------------------ */
  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const cards = Array.from(
        el.querySelectorAll<HTMLElement>("[data-skill-card]"),
      );
      if (!cards.length) return;
      // The card whose left edge is nearest the rail's own left edge — which
      // is exactly what `scroll-snap-align: start` is lining up.
      const origin = el.scrollLeft;
      let best = 0;
      let bestDistance = Infinity;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft - el.offsetLeft - origin);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [groups.length]);

  const goTo = useCallback((i: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-skill-card]")[i];
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft - el.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  return (
    <div>
      {/* The same body that anchors the desktop orbit, kept as a small
          decorative anchor so the section reads the same on a phone. */}
      <div className="relative mb-14 h-28 w-full sm:h-32">
        <OrbitPlanet className="[--planet-size:6.5rem] sm:[--planet-size:7.5rem]" />
      </div>

      <div ref={rail} className="rail no-scrollbar" data-cursor="drag">
        {groups.map((group, i) => (
          <article
            key={group.id}
            data-skill-card
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${groups.length}: ${group.label}`}
            className="glass relative flex min-h-[16rem] w-[78vw] max-w-[22rem] shrink-0 snap-start flex-col justify-between rounded-2xl p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(108,243,255,0.5),transparent)",
                opacity: i === active ? 1 : 0.25,
              }}
            />
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="label">{pad2(i + 1)}</span>
                {group.placeholder && <PlaceholderChip />}
              </div>
              <h3 className="display-md mt-6">{group.label}</h3>
              <p className="body-base mt-3">{group.summary}</p>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-3 gap-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--color-line-soft)] px-3 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-[var(--color-mute)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Position readout ------------------------------------------------- */}
      <div className="mt-6 flex items-center gap-5">
        <span className="label label-bright tabular-nums shrink-0">
          {pad2(active + 1)} / {pad2(groups.length)}
        </span>

        {/* No gap between the markers: at four or five disciplines on a 320px
            screen each one is only ~22px wide, so any spacing *between* the
            buttons becomes a dead strip a thumb can land in and get nothing.
            The buttons run edge to edge and the visible bar is inset by the
            button's own padding instead — same look, no dead pixels. */}
        <div className="flex flex-1 items-center">
          {groups.map((group, i) => (
            <button
              key={group.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${group.label}`}
              aria-current={i === active ? "true" : undefined}
              className="flex h-11 flex-1 items-center px-1"
            >
              <span
                className={cn(
                  "block h-0.5 w-full rounded-full transition-all duration-500",
                  i === active
                    ? "bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(108,243,255,0.55)]"
                    : "bg-[rgba(244,246,255,0.14)]",
                )}
              />
            </button>
          ))}
        </div>

        <span
          aria-hidden
          className={cn(
            "label shrink-0 transition-opacity duration-500",
            active === groups.length - 1 ? "opacity-0" : "opacity-100",
          )}
        >
          SWIPE →
        </span>
      </div>
    </div>
  );
}
