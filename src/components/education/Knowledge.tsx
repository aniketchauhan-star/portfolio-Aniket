"use client";

import { profile } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Stagger } from "@/components/ui/Stagger";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Education & certifications. Deliberately the quietest section on the page —
 * a plain modular grid with no 3D reaction, so the eye gets a rest between
 * the timeline and the contact finale.
 */
export function Knowledge() {
  const { education, certifications } = profile;
  const reduced = useReducedMotion();

  if (!education.length && !certifications.length) return null;

  return (
    <Section
      id="knowledge"
      chapter="knowledge"
      label="Education and certifications"
      className="py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader
          index="05"
          label="KNOWLEDGE"
          titleLines={["LEARNING", "NEVER", "STOPS."]}
        />

        {education.length > 0 && (
          <>
            <p className="label mt-20 lg:mt-24">EDUCATION</p>
            <Stagger
              disabled={reduced}
              stagger={0.065}
              className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {education.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex min-h-[14rem] flex-col justify-between rounded-2xl border border-[var(--color-line-soft)] bg-[#05070d] p-7 transition-colors duration-700 hover:border-[color-mix(in_oklab,var(--color-cyan)_22%,transparent)] hover:bg-[#070a12]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-[2.6rem] leading-none tracking-[-0.05em] text-[rgba(244,246,255,0.13)] transition-colors duration-700 group-hover:text-[rgba(108,243,255,0.28)]">
                      {item.year}
                    </span>
                    {item.placeholder && <PlaceholderChip />}
                  </div>
                  <div>
                    <h3 className="text-[1.05rem] leading-snug font-medium tracking-[-0.01em]">
                      {item.institution}
                    </h3>
                    <p className="mt-2 font-mono text-[0.68rem] tracking-[0.18em] text-[var(--color-cyan)]">
                      {item.qualification.toUpperCase()}
                    </p>
                    {item.detail && (
                      <p className="body-base mt-4 text-[0.85rem]">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </Stagger>
          </>
        )}

        {certifications.length > 0 && (
          <>
            <p className="label mt-16">CERTIFICATIONS</p>
            <Stagger
              disabled={reduced}
              stagger={0.065}
              className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {certifications.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex min-h-[12rem] flex-col justify-between rounded-2xl border border-[var(--color-line-soft)] bg-[#05070d] p-7 transition-colors duration-700 hover:border-[color-mix(in_oklab,var(--color-violet)_22%,transparent)] hover:bg-[#070a12]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-[2.2rem] leading-none tracking-[-0.05em] text-[rgba(244,246,255,0.13)] transition-colors duration-700 group-hover:text-[rgba(132,107,255,0.3)]">
                      {item.year}
                    </span>
                    {item.placeholder && <PlaceholderChip />}
                  </div>
                  <div>
                    <h3 className="text-[1.02rem] leading-snug font-medium tracking-[-0.01em]">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-mono text-[0.68rem] tracking-[0.18em] text-[var(--color-mute)]">
                      {item.issuer.toUpperCase()}
                    </p>
                    {item.credentialUrl && (
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="open"
                        className="label label-bright mt-5 inline-flex items-center gap-2 transition-colors duration-400 hover:text-[var(--color-cyan)]"
                      >
                        CREDENTIAL
                        <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                          ↗
                        </span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </Stagger>
          </>
        )}
      </div>
    </Section>
  );
}
