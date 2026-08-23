"use client";

import { useCallback, useState } from "react";
import { profile, type Project } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { sceneState } from "@/lib/scene-state";

export function Projects() {
  const projects = profile.projects;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
  }, []);

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
        />
      </div>

      <div className="shell mt-20 flex flex-col gap-24 lg:mt-28 lg:gap-36">
        {projects.map((project, i) => (
          <div
            key={project.id}
            className="w-full lg:w-[86%] xl:w-[80%]"
            style={{ marginLeft: i % 2 === 1 ? "auto" : undefined }}
          >
            <ProjectCard project={project} index={i} onOpen={open} />
          </div>
        ))}
      </div>

      <ProjectModal
        project={openIndex === null ? null : projects[openIndex]}
        index={openIndex ?? 0}
        onClose={close}
      />
    </Section>
  );
}
