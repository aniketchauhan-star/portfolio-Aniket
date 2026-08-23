"use client";

import { useState } from "react";
import { profile } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FadeUp } from "@/components/ui/FadeUp";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SkillOrbit } from "./SkillOrbit";
import { SkillsMobile } from "./SkillsMobile";

export function Skills() {
  const groups = profile.skills;
  const [activeId, setActiveId] = useState<string | null>(null);
  const reduced = useReducedMotion();

  if (!groups.length) return null;

  const active = groups.find((g) => g.id === activeId) ?? null;

  return (
    <Section
      id="skills"
      chapter="skills"
      label="Capabilities"
      className="py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader
          index="02"
          label="CAPABILITIES"
          titleLines={["TOOLS", "OF THE", "TRADE"]}
        />

        {/* Desktop orbit ---------------------------------------------- */}
        <div className="mt-20 hidden lg:mt-24 lg:grid lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-7">
            <SkillOrbit
              groups={groups}
              activeId={activeId}
              onActivate={setActiveId}
            />
          </div>

          <div className="lg:col-span-5">
            <div className="relative min-h-[19rem]">
              {active ? (
                <div key={active.id}>
                  <div className="flex items-center gap-3">
                    <span className="label label-bright">
                      <ScrambleText
                        text={active.label}
                        trigger={active.id}
                        onView={false}
                        disabled={reduced}
                      />
                    </span>
                    {active.placeholder && <PlaceholderChip />}
                  </div>

                  <p className="display-md mt-6 max-w-[22ch]">
                    {active.summary}
                  </p>

                  <ul className="mt-9 flex flex-wrap gap-x-3 gap-y-2.5">
                    {active.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-[var(--color-line-soft)] px-3.5 py-2 font-mono text-[0.625rem] tracking-[0.16em] text-[var(--color-mute)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setActiveId(null)}
                    data-cursor="link"
                    className="label mt-10 inline-flex items-center gap-2 transition-colors duration-400 hover:text-[var(--color-ink)]"
                  >
                    ← RESUME ORBIT
                  </button>
                </div>
              ) : (
                <div>
                  <span className="label label-bright">SELECT A DISCIPLINE</span>
                  <p className="body-lg mt-6 max-w-[34ch]">
                    Each node is one area of practice. Hover to slow the system,
                    select one to read what sits inside it.
                  </p>
                  <ul className="mt-10 flex flex-col gap-3">
                    {groups.map((g) => (
                      <li key={g.id}>
                        <button
                          onClick={() => setActiveId(g.id)}
                          data-cursor="link"
                          className="group flex w-full items-center justify-between border-b border-[var(--color-line-soft)] py-3 text-left transition-colors duration-400 hover:border-[color-mix(in_oklab,var(--color-cyan)_28%,transparent)]"
                        >
                          <span className="font-mono text-[0.7rem] tracking-[0.2em] text-[var(--color-mute)] transition-colors duration-400 group-hover:text-[var(--color-ink)]">
                            {g.label}
                          </span>
                          <span className="text-[var(--color-cyan)] opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / tablet rail ---------------------------------------- */}
        <FadeUp disabled={reduced} className="mt-16 lg:hidden">
          <SkillsMobile groups={groups} />
        </FadeUp>
      </div>
    </Section>
  );
}
