"use client";

import { useEffect, useRef } from "react";
import { profile, socialLinks, primaryContactHref } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { RevealText } from "@/components/ui/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp } from "@/components/ui/FadeUp";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sceneState } from "@/lib/scene-state";

/**
 * The final beat. The robot comes back to the foreground, its rings
 * align and the particle field gathers around it — and pointer proximity to
 * the primary control gently increases that pull.
 */
export function Contact() {
  const cta = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* Pointer proximity → particle attraction -------------------------------- */
  useEffect(() => {
    if (reduced) return;
    const el = cta.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      // Full pull within ~180px, nothing beyond ~620px.
      const near = 1 - Math.min(1, Math.max(0, (d - 180) / 440));
      sceneState.attract = near * 0.85;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      sceneState.attract = 0;
    };
  }, [reduced]);

  /* Leaving the section releases the field. */
  useEffect(() => () => {
    sceneState.attract = 0;
  }, []);

  const isMail = primaryContactHref.startsWith("mailto:");

  return (
    <Section
      id="contact"
      chapter="contact"
      label="Contact"
      className="flex min-h-[92svh] flex-col justify-center py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionLabel index="06" label="CONTACT" />

        <RevealText
          disabled={reduced}
          stagger={0.07}
          duration={1.1}
          lines={profile.contact.eyebrow}
          className="display-lg mt-12 text-[var(--color-mute)]"
        />

        <RevealText
          as="h2"
          disabled={reduced}
          stagger={0.075}
          duration={1.3}
          lines={profile.contact.lines}
          className="display-contact mt-8 -ml-[0.05em]"
        />

        <div
          ref={cta}
          className="mt-16 flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between"
        >
          <FadeUp disabled={reduced} delay={0.1}>
            <MagneticButton
              href={primaryContactHref}
              external={!isMail}
              cursor={isMail ? "link" : "open"}
              strength={10}
              ariaLabel={`${profile.contact.ctaLabel} with ${profile.name}`}
              className="group inline-flex min-h-[64px] items-center gap-4 rounded-full border border-[color-mix(in_oklab,var(--color-cyan)_26%,transparent)] bg-[rgba(108,243,255,0.05)] px-9 backdrop-blur-md transition-colors duration-500 hover:bg-[rgba(108,243,255,0.1)]"
            >
              <span className="font-mono text-[0.72rem] tracking-[0.22em] text-[var(--color-ink)]">
                {profile.contact.ctaLabel}
              </span>
              <span className="text-[var(--color-cyan)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45">
                ↗
              </span>
            </MagneticButton>
          </FadeUp>

          <FadeUp
            disabled={reduced}
            delay={0.18}
            className="flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-cursor={link.external ? "open" : "link"}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group inline-flex min-h-[44px] items-center gap-2"
              >
                <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
                  {link.label}
                </span>
                <span className="inline-block text-[var(--color-cyan)] text-xs transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            ))}
          </FadeUp>
        </div>
      </div>
    </Section>
  );
}
