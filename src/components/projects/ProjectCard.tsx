"use client";

import type { Project } from "@/data/profile";
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
 * One tile in the work grid.
 *
 * The section used to be six full-width cards stacked vertically — 5.4 screens
 * of scrolling on a phone and 7.5 on a desktop, about half the entire page for
 * one section, growing by another screen with every project added. A tile is
 * the same card reduced to what a visitor actually needs in order to *choose*:
 * the poster, the number, the title and whether it is playable. Everything else
 * — the description, the case study, the build itself — already lives in the
 * overlay a tap away, so nothing was lost by taking it off the page.
 *
 * The whole tile is one control. There is no separate "view" link to hit,
 * which is what makes it work with a thumb.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const num = pad2(index + 1);

  /* Tell the WebGL layer which project the visitor is considering, so the
     robot shifts posture between them. Cleared on the way out so the scene
     falls back to the section's own base posture. */
  const markActive = () => {
    sceneState.activeProject = index;
  };
  const clearActive = () => {
    sceneState.activeProject = -1;
  };

  return (
    <article className="group relative">
      <div
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
        onPointerEnter={markActive}
        onPointerLeave={clearActive}
        onFocus={markActive}
        onBlur={clearActive}
        className={cn(
          "edge press-card relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#070910]",
          "transition-colors duration-700",
          "group-hover:border-[color-mix(in_oklab,var(--color-cyan)_26%,transparent)]",
        )}
      >
        {/* Light catching the top edge. Hover-only on a desktop; on touch
            `touch-edge-light` rests it visible, since it is the only thing
            marking the tile as a live surface. */}
        <span
          aria-hidden
          className="touch-edge-light pointer-events-none absolute inset-x-0 top-0 z-20 h-px opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg,transparent,rgba(108,243,255,0.75),transparent)",
          }}
        />

        {/* Poster ------------------------------------------------------- */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
            <ProjectVisual
              src={project.image}
              alt={project.title}
              priority={index < 2}
              sizes="(max-width: 1023px) 46vw, 31vw"
            />
          </div>

          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(3,4,7,0.88) 0%, rgba(3,4,7,0.45) 22%, rgba(3,4,7,0.05) 52%, transparent 74%)",
            }}
          />

          {/* Both markers sit in the scrim along the bottom edge, not on the
              open poster. Every one of these covers is a bright, busy title
              card: at the top the number simply vanished into the artwork, and
              the chip landed on the title. The bottom band is the one part of
              the image that is dark by construction, and it is the part the
              artwork uses least. */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 bottom-2 font-display text-[1.6rem] leading-none tracking-[-0.05em] text-[rgba(244,246,255,0.55)] transition-colors duration-700 group-hover:text-[rgba(108,243,255,0.85)] sm:text-[2rem]"
          >
            {num}
          </span>

          {project.playUrl && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--color-cyan)_40%,transparent)] bg-[rgba(3,4,7,0.62)] px-2 py-1 backdrop-blur-sm">
              <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)]" />
              <span className="font-mono text-[0.5rem] leading-none tracking-[0.18em] text-[var(--color-cyan)]">
                PLAYABLE
              </span>
            </span>
          )}
        </div>

        {/* Caption ------------------------------------------------------ */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="label label-bright">{project.category}</span>
            <span className="label">/ {project.year}</span>
            {project.placeholder && <PlaceholderChip />}
          </div>

          <h3 className="mt-3 font-display text-[1.05rem] leading-[1.15] font-medium tracking-[-0.02em] text-[var(--color-ink)] sm:text-[1.25rem]">
            {project.title}
          </h3>

          <span className="touch-affordance label label-bright mt-auto inline-flex items-center gap-2 pt-5 transition-colors duration-500 group-hover:text-[var(--color-cyan)]">
            {project.playUrl ? "PLAY" : "VIEW"}
            <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
