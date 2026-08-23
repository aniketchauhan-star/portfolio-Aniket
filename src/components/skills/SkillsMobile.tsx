"use client";

import type { SkillGroup } from "@/data/profile";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { pad2 } from "@/lib/utils";
import { OrbitPlanet } from "./OrbitPlanet";

/**
 * The small-screen reading of the capability system: the same glass language
 * and the same data, laid out as a horizontally scrollable rail instead of an
 * orbit. Not a shrunken desktop layout — a layout designed for the thumb.
 */
export function SkillsMobile({ groups }: { groups: SkillGroup[] }) {
  return (
    <div>
      {/* The same body that anchors the desktop orbit, kept as a small
          decorative anchor so the section reads the same on a phone. */}
      <div className="relative mb-14 h-28 w-full sm:h-32">
        <OrbitPlanet className="[--planet-size:6.5rem] sm:[--planet-size:7.5rem]" />
      </div>

      <div className="rail no-scrollbar" data-cursor="drag">
        {groups.map((group, i) => (
          <article
            key={group.id}
            className="glass relative flex min-h-[16rem] w-[78vw] max-w-[22rem] shrink-0 snap-start flex-col justify-between rounded-2xl p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(108,243,255,0.5),transparent)",
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

      <p className="label mt-5">SWIPE TO EXPLORE →</p>
    </div>
  );
}
