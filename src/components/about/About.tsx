"use client";

import { profile, metadataRows } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { RevealWords } from "@/components/ui/RevealWords";
import { FadeUp } from "@/components/ui/FadeUp";
import { Stagger } from "@/components/ui/Stagger";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/** Lines prefixed with "~" in profile data render as outlined type. */
function statementLine(raw: string) {
  const outlined = raw.startsWith("~");
  return { text: outlined ? raw.slice(1) : raw, outlined };
}

export function About() {
  const reduced = useReducedMotion();

  return (
    <Section
      id="about"
      chapter="about"
      label="About"
      grid
      className="py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader
          index="01"
          label="IDENTITY"
          titleLines={["BEYOND", "THE SCREEN"]}
        />

        <div className="mt-20 grid gap-16 lg:mt-28 lg:grid-cols-12 lg:gap-12">
          {/* Editorial statement -------------------------------------- */}
          <div className="lg:col-span-7">
            <RevealWords
              disabled={reduced}
              stagger={0.04}
              lines={profile.aboutStatement.map((raw) => statementLine(raw).text)}
              lineClassName={(i) =>
                cn(
                  statementLine(profile.aboutStatement[i]).outlined &&
                    "outline-type",
                )
              }
              className="display-lg text-[var(--color-ink)]"
            />
          </div>

          {/* Biography + metadata ------------------------------------- */}
          <div className="lg:col-span-5 lg:pt-3">
            <FadeUp disabled={reduced}>
              <div className="flex items-center gap-3">
                <span className="label">
                  <ScrambleText text="BIOGRAPHY" disabled={reduced} />
                </span>
                {profile.aboutPlaceholder && <PlaceholderChip />}
              </div>
            </FadeUp>

            <Stagger
              disabled={reduced}
              stagger={0.08}
              className="mt-6 flex flex-col gap-5"
            >
              {profile.about.map((para, i) => (
                <p key={i} className="body-lg max-w-[52ch]">
                  {para}
                </p>
              ))}
            </Stagger>

            <Stagger
              disabled={reduced}
              stagger={0.06}
              className="mt-14 grid grid-cols-2 gap-x-8 gap-y-9"
            >
              {metadataRows.map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <span className="label">{item.label}</span>
                  <span className="font-mono text-[0.78rem] leading-snug tracking-[0.1em] text-[var(--color-ink)]">
                    {item.label === "STATUS" ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)]" />
                        <ScrambleText text={item.value} disabled={reduced} />
                      </span>
                    ) : (
                      item.value
                    )}
                  </span>
                </div>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </Section>
  );
}
