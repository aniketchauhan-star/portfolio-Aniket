"use client";

import { RevealText } from "@/components/ui/RevealText";
import { RevealLine } from "@/components/ui/RevealLine";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** "01", "02", … */
  index: string;
  /** "IDENTITY", "CAPABILITIES", … */
  label: string;
  /** One entry per visual line of the heading. */
  titleLines: string[];
  className?: string;
  titleClassName?: string;
  /** Optional short paragraph under the heading. */
  intro?: string;
}

/** The recurring `NN / LABEL` + oversized heading pattern. */
export function SectionHeader({
  index,
  label,
  titleLines,
  className,
  titleClassName,
  intro,
}: SectionHeaderProps) {
  const reduced = useReducedMotion();

  return (
    <header className={cn("relative", className)}>
      <SectionLabel index={index} label={label} />

      <RevealText
        as="h2"
        lines={titleLines}
        disabled={reduced}
        className={cn("display-xl mt-7", titleClassName)}
      />

      {intro && (
        <p className="body-lg mt-8 max-w-[46ch]">{intro}</p>
      )}

      <RevealLine className="mt-10" disabled={reduced} />
    </header>
  );
}
