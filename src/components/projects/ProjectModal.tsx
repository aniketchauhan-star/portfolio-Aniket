"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Project } from "@/data/profile";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { setScrollLocked } from "@/components/layout/SmoothScroll";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { ProjectVisual } from "./ProjectVisual";
import { GameFrame } from "./GameFrame";
import { pad2 } from "@/lib/utils";

interface CaseField {
  label: string;
  value?: string;
}

/**
 * Cinematic full-screen project detail.
 *
 * Every field is optional: anything missing from the data is omitted entirely
 * rather than rendered as an empty heading, so a half-filled project still
 * reads as a finished page.
 */
export function ProjectModal({
  project,
  index,
  onClose,
}: {
  project: Project | null;
  index: number;
  onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const open = Boolean(project);

  /* Scroll lock, focus, Escape, focus trap -------------------------------- */
  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !root.current) return;
      const focusables = root.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [open, onClose]);

  /* Entrance --------------------------------------------------------------- */
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const el = root.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          el,
          { clipPath: "inset(48% 0% 48% 0%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 0.78,
            ease: EASE.inOut,
          },
        )
        .fromTo(
          ".js-modal-num",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE.out },
          "-=0.35",
        )
        .fromTo(
          ".js-modal-reveal",
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.9, ease: EASE.out, stagger: 0.06 },
          "-=0.4",
        );
    }, root);

    return () => ctx.revert();
  }, [open, project?.id]);

  if (!project) return null;

  const num = pad2(index + 1);

  const caseFields: CaseField[] = [
    { label: "PROBLEM", value: project.problem },
    { label: "PROCESS", value: project.process },
    { label: "SOLUTION", value: project.solution },
    { label: "RESULT", value: project.result },
  ].filter((f) => Boolean(f.value));

  const facts: CaseField[] = [
    { label: "ROLE", value: project.role },
    { label: "YEAR", value: project.year },
    { label: "CATEGORY", value: project.category },
  ].filter((f) => Boolean(f.value));

  const links = [
    project.liveUrl && { label: "LIVE SITE", href: project.liveUrl },
    project.githubUrl && { label: "SOURCE", href: project.githubUrl },
    project.caseStudyUrl && {
      label: "CASE STUDY",
      href: project.caseStudyUrl,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  /**
   * Portalled to <body>: `main` establishes a stacking context, so a fixed
   * overlay rendered inside it would sit underneath the navbar no matter how
   * high its z-index.
   */
  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — project detail`}
      className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-[rgba(3,4,7,0.97)] backdrop-blur-xl"
    >
      {/* Header ---------------------------------------------------------- */}
      <div className="sticky top-0 z-10 border-b border-[var(--color-line-soft)] bg-[rgba(3,4,7,0.72)] backdrop-blur-xl">
        <div className="shell flex items-center justify-between py-4">
          <span className="js-modal-num label label-bright">
            PROJECT {num}
          </span>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close project detail"
            data-cursor="link"
            className="edge flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--color-cyan)_38%,transparent)]"
          >
            <X size={16} strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <div className="shell pt-14 pb-28">
        {/* Title ------------------------------------------------------- */}
        <div className="js-modal-reveal flex flex-wrap items-center gap-3">
          <span className="label label-bright">{project.category}</span>
          <span className="label">/ {project.year}</span>
          {project.placeholder && <PlaceholderChip />}
        </div>

        <h2 className="js-modal-reveal display-xl mt-6 max-w-[16ch]">
          {project.title}
        </h2>

        {/* Hero visual — or the playable build, when there is one -------- */}
        <div className="js-modal-reveal mt-12">
          {project.playUrl ? (
            <GameFrame
              src={project.playUrl}
              title={project.title}
              poster={project.image}
              aspect={project.playAspect}
            />
          ) : (
            <div className="edge relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
              <ProjectVisual src={project.image} alt={project.title} />
            </div>
          )}
        </div>

        {/* Facts + description ------------------------------------------ */}
        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="js-modal-reveal lg:col-span-4">
            <dl className="flex flex-col gap-8">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-2">
                  <dt className="label">{f.label}</dt>
                  <dd className="font-mono text-[0.78rem] tracking-[0.1em] text-[var(--color-ink)]">
                    {f.value}
                  </dd>
                </div>
              ))}

              {project.technologies.length > 0 && (
                <div className="flex flex-col gap-3">
                  <dt className="label">TECHNOLOGIES</dt>
                  <dd className="flex flex-wrap gap-2">
                    {project.technologies.map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full border border-[var(--color-line-soft)] px-3 py-1.5 font-mono text-[0.5875rem] tracking-[0.16em] text-[var(--color-mute)]"
                      >
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="lg:col-span-8">
            <p className="js-modal-reveal body-lg max-w-[62ch] text-[1.05rem]">
              {project.description}
            </p>

            {caseFields.length > 0 && (
              <div className="mt-16 flex flex-col gap-12">
                {caseFields.map((f) => (
                  <div key={f.label} className="js-modal-reveal">
                    <div className="flex items-center gap-4">
                      <span className="label label-bright">{f.label}</span>
                      <span className="h-px flex-1 bg-[var(--color-line-soft)]" />
                    </div>
                    <p className="body-lg mt-5 max-w-[62ch]">{f.value}</p>
                  </div>
                ))}
              </div>
            )}

            {project.gallery && project.gallery.length > 0 && (
              <div className="js-modal-reveal mt-16 grid gap-5 sm:grid-cols-2">
                {project.gallery.map((src, i) => (
                  <div
                    key={src}
                    className="edge relative aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <ProjectVisual
                      src={src}
                      alt={`${project.title} — image ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div className="js-modal-reveal mt-16 flex flex-wrap gap-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="open"
                    className="group inline-flex min-h-[48px] items-center gap-3 rounded-full border border-[var(--color-line)] px-6 transition-colors duration-500 hover:border-[color-mix(in_oklab,var(--color-cyan)_38%,transparent)]"
                  >
                    <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
                      {l.label}
                    </span>
                    <span className="text-[var(--color-cyan)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
