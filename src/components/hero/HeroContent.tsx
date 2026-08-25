"use client";

import { profile } from "@/data/profile";
import { RevealText } from "@/components/ui/RevealText";
import { FadeUp } from "@/components/ui/FadeUp";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToId } from "@/components/layout/SmoothScroll";
import { LocalTime } from "./LocalTime";
import { PointerReadout } from "./PointerReadout";
import { ScrambleText } from "@/components/ui/ScrambleText";

/**
 * The first viewport. Everything here is choreographed as one sequence:
 * label → ANIKET → CHAUHAN → subtitle → controls, each handing off to the
 * next. Nothing bounces; nothing arrives at the same time as anything else.
 */
export function HeroContent({ play }: { play: boolean }) {
  const reduced = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <div className="relative w-full">
      {/* Eyebrow ---------------------------------------------------------- */}
      <FadeUp play={play} disabled={reduced} delay={0.1} distance={14}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] opacity-70" />
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] blur-[3px]" />
          </span>
          <span className="label label-bright">PORTFOLIO / {year}</span>
        </div>
      </FadeUp>

      {/* Name ------------------------------------------------------------- */}
      <RevealText
        as="h1"
        play={play}
        disabled={reduced}
        delay={0.28}
        stagger={0.11}
        duration={1.35}
        lines={[profile.firstName.toUpperCase(), profile.lastName.toUpperCase()]}
        className="display-hero mt-5 -ml-[0.055em] text-[var(--color-ink)] md:mt-6"
      />

      {/* Subtitle --------------------------------------------------------- */}
      <RevealText
        play={play}
        disabled={reduced}
        delay={0.86}
        stagger={0.07}
        duration={1}
        lines={profile.heroSubtitle}
        className="hero-subtitle mt-6 font-mono md:mt-9 text-[0.78rem] leading-[1.75] tracking-[0.2em] text-[var(--color-mute)] sm:text-[0.9rem] sm:tracking-[0.24em]"
        lineClassName="text-[var(--color-mute)]"
      />

      {/* Controls --------------------------------------------------------- */}
      <FadeUp
        play={play}
        disabled={reduced}
        delay={1.12}
        distance={18}
        className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4 md:mt-11"
      >
        <MagneticButton
          onClick={() => scrollToId("work")}
          ariaLabel="Explore selected work"
          className="group inline-flex min-h-[52px] items-center gap-3 rounded-full border border-[var(--color-line)] bg-[rgba(255,255,255,0.025)] px-7 backdrop-blur-md transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--color-cyan)_38%,transparent)] hover:bg-[rgba(108,243,255,0.055)]"
        >
          <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
            EXPLORE WORK
          </span>
          <span className="text-[var(--color-cyan)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[3px]">
            ↓
          </span>
        </MagneticButton>

        <MagneticButton
          href={profile.linkedin}
          external
          cursor="open"
          ariaLabel="Connect with Aniket Chauhan on LinkedIn"
          className="group inline-flex min-h-[52px] items-center gap-3 rounded-full px-7 transition-colors duration-500"
        >
          <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
            LET&apos;S CONNECT
          </span>
          <span className="text-[var(--color-cyan)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45">
            ↗
          </span>
        </MagneticButton>
      </FadeUp>
    </div>
  );
}

/** The technical strip pinned to the bottom of the hero. */
export function HeroMeta({ play }: { play: boolean }) {
  const reduced = useReducedMotion();

  return (
    <FadeUp
      play={play}
      disabled={reduced}
      delay={1.35}
      distance={12}
      className="shell flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-3 pb-[calc(2rem+var(--safe-b))] md:pb-[calc(2.5rem+var(--safe-b))]"
    >
      <div className="flex items-center gap-6">
        <span className="label label-bright">
          {profile.location.toUpperCase()}
        </span>
        {profile.availability && (
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)]" />
            <span className="label label-bright">
              <ScrambleText text={profile.availability} disabled={reduced} />
            </span>
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-8">
        <PointerReadout />
        <div className="flex items-center gap-3">
          <span className="label">LOCAL TIME</span>
          <LocalTime />
        </div>
      </div>
    </FadeUp>
  );
}
