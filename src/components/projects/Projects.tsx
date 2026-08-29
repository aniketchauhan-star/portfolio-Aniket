"use client";

import { useCallback, useRef, useState } from "react";
import { profile, type Project } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Stagger } from "@/components/ui/Stagger";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { sceneState } from "@/lib/scene-state";

/**
 * Selected work, as a grid of poster tiles that open a full-screen overlay.
 *
 * This used to be one full-width card per project, stacked. With six projects
 * that was 5.4 screens of scrolling on a phone and 7.5 on a desktop — roughly
 * half the whole page for a single section, and another screen for every
 * project added. The grid holds the same six in about a screen and a half, and
 * a seventh costs half a row instead of a full screen.
 *
 * The trade is deliberate: the card's description and technology list are gone
 * from the page. They were never the thing a visitor used to *choose* a
 * project — the poster and the title are — and both are still one tap away in
 * the overlay, in full rather than clamped to three lines.
 */
export function Projects() {
  const projects = profile.projects;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const open = useCallback(
    (project: Project) => {
      const i = projects.findIndex((p) => p.id === project.id);
      setOpenIndex(i);
    },
    [projects],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    // Nudge the scene back to the section's own posture.
    sceneState.chapter = "projects";
    sceneState.activeProject = -1;
  }, []);

  /**
   * The scene reads `projectProgress` to animate through this chapter. It used
   * to come from a per-card ScrollTrigger, which a grid has no equivalent of —
   * two tiles share a row and neither one "owns" the viewport. One trigger
   * across the whole grid gives the same 0 → 1 sweep, and which project is
   * active is now driven by pointer and focus on the tiles themselves.
   */
  useIsomorphicLayoutEffect(() => {
    const el = track.current;
    if (!el || reduced) return;
    registerGsap();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        end: "bottom 30%",
        onUpdate: (self) => {
          sceneState.projectProgress = self.progress;
        },
      });
    }, track);

    return () => ctx.revert();
  }, [reduced]);

  if (!projects.length) return null;

  return (
    <Section
      id="work"
      chapter="projects"
      label="Selected work"
      className="py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader
          index="03"
          label="SELECTED WORK"
          titleLines={["PROJECTS", "THAT DEFINE", "MY WORK."]}
          intro="Tap any project to open it — the case study, the images and, where there is one, the build itself running in the page."
        />

        <div ref={track}>
          <Stagger
            disabled={reduced}
            stagger={0.07}
            className="mt-16 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-24 lg:grid-cols-3 lg:gap-6"
          >
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpen={open}
              />
            ))}
          </Stagger>
        </div>
      </div>

      <ProjectModal
        project={openIndex === null ? null : projects[openIndex]}
        index={openIndex ?? 0}
        onClose={close}
      />
    </Section>
  );
}
