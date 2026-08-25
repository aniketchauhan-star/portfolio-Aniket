"use client";

import { useRef } from "react";
import type { Project } from "@/data/profile";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useMediaQuery";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { ProjectVisual } from "./ProjectVisual";
import { sceneState } from "@/lib/scene-state";
import { cn, pad2 } from "@/lib/utils";

export interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}

/**
 * A floating digital display. Two independent motion layers:
 *
 *  · scroll — the card rises while its image settles from 1.1 to 1
 *  · pointer — a ≤3° tilt with a little image parallax
 *
 * Both are disabled for reduced motion, and the tilt is skipped on touch.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const num = pad2(index + 1);

  /* Scroll choreography ---------------------------------------------------- */
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    const img = media.current;
    if (!el || !img) return;
    registerGsap();

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.fromTo(
        el,
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.3,
          ease: EASE.out,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );

      gsap.fromTo(
        img,
        { scale: 1.1 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            end: "top 38%",
            scrub: 0.8,
          },
        },
      );

      // Tell the WebGL layer which project owns the viewport, so the core can
      // shift orientation between projects instead of being reloaded.
      ScrollTriggerCreate(el, index);
    }, root);

    return () => ctx.revert();
  }, [reduced, index]);

  /* Pointer tilt ----------------------------------------------------------- */
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    const box = inner.current;
    const img = media.current;
    if (!el || !box || !img || reduced || isTouch) return;
    registerGsap();

    // GSAP's CSS plugin names these `rotationX` / `rotationY`; the `rotateX`
    // alias cannot be reset cleanly and warns on every context revert.
    gsap.set(box, { transformPerspective: 1200, rotationX: 0, rotationY: 0 });
    const rx = gsap.quickTo(box, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(box, "rotationY", { duration: 0.8, ease: "power3.out" });
    const ix = gsap.quickTo(img, "xPercent", { duration: 1, ease: "power3.out" });
    const iy = gsap.quickTo(img, "yPercent", { duration: 1, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      rx(-dy * 2.4);
      ry(dx * 3);
      ix(dx * -1.6);
      iy(dy * -1.6);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      ix(0);
      iy(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf([box, img]);
    };
  }, [reduced, isTouch]);

  return (
    <article
      ref={root}
      className={cn(
        "group relative w-full",
        index % 2 === 1 ? "lg:ml-auto" : "lg:mr-auto",
      )}
      style={{ perspective: "1200px" }}
    >
      <div
        ref={inner}
        role="button"
        tabIndex={0}
        data-cursor="view"
        aria-label={
          project.playUrl
            ? `Play project: ${project.title}`
            : `Open project: ${project.title}`
        }
        onClick={() => onOpen(project)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(project);
          }
        }}
        className="edge press-card relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-[#070910] transition-colors duration-700 will-change-transform group-hover:border-[color-mix(in_oklab,var(--color-cyan)_24%,transparent)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Light catching the top edge on hover */}
        {/* Hover-only on a desktop; on touch this hairline is the only thing
            marking the card as a live surface, so `touch-edge-light` rests it
            at a low opacity instead of at zero. */}
        <span
          aria-hidden
          className="touch-edge-light pointer-events-none absolute inset-x-0 top-0 z-20 h-px opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(108,243,255,0.75),transparent)",
          }}
        />

        {/* Media -------------------------------------------------------- */}
        <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[16/8.4]">
          <div
            ref={media}
            className="absolute inset-0 will-change-transform transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          >
            <ProjectVisual
              src={project.image}
              alt={project.title}
              priority={index === 0}
            />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(3,4,7,0.82) 0%, rgba(3,4,7,0.1) 42%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-6 right-7 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-none tracking-[-0.05em] text-[rgba(244,246,255,0.14)] transition-colors duration-700 group-hover:text-[rgba(108,243,255,0.3)]"
          >
            {num}
          </span>
        </div>

        {/* Metadata ----------------------------------------------------- */}
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:p-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="label label-bright">{project.category}</span>
              <span className="label">/ {project.year}</span>
              {project.playUrl && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--color-cyan)_34%,transparent)] px-2.5 py-1">
                  <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)]" />
                  <span className="font-mono text-[0.5625rem] leading-none tracking-[0.2em] text-[var(--color-cyan)]">
                    PLAYABLE
                  </span>
                </span>
              )}
              {project.placeholder && <PlaceholderChip />}
            </div>

            <h3 className="display-lg mt-5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[5px]">
              {project.title}
            </h3>

            <p className="body-base mt-5 line-clamp-3 max-w-[58ch]">
              {project.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-6 lg:items-end">
            {project.technologies.length > 0 && (
              <ul className="flex flex-wrap gap-2 lg:justify-end">
                {project.technologies.map((t: string) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--color-line-soft)] px-3 py-1.5 font-mono text-[0.5875rem] tracking-[0.16em] text-[var(--color-faint)]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <span className="touch-affordance label label-bright inline-flex items-center gap-2 transition-colors duration-500 group-hover:text-[var(--color-cyan)]">
              {project.playUrl ? "PLAY PROJECT" : "VIEW PROJECT"}
              <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Registers the "which project is active" trigger for the WebGL layer. */
function ScrollTriggerCreate(el: HTMLElement, index: number) {
  gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onToggle: (self) => {
        if (self.isActive) sceneState.activeProject = index;
      },
      onUpdate: (self) => {
        sceneState.projectProgress = self.progress;
      },
    },
  });
}
