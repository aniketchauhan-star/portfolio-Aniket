"use client";

import { ScrambleText } from "./ScrambleText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface SectionLabelProps {
  /** "01", "02", … */
  index: string;
  /** "IDENTITY", "CAPABILITIES", … */
  label: string;
  className?: string;
  /** Draw the trailing hairline. */
  rule?: boolean;
}

/**
 * The recurring `NN / LABEL` marker. One of the few places text scrambling is
 * used — short, technical, and it resolves immediately.
 */
export function SectionLabel({
  index,
  label,
  className,
  rule = true,
}: SectionLabelProps) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="label label-bright">
        {index} / <ScrambleText text={label} disabled={reduced} duration={620} />
      </span>
      {rule && (
        <span className="h-px w-24 max-w-[18vw] bg-[var(--color-line)]" />
      )}
    </div>
  );
}
