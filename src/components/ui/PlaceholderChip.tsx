import { cn } from "@/lib/utils";

/**
 * Marks content that has not been replaced with real information yet.
 * Nothing on this site is presented as fact until the flag is removed from
 * `src/data/profile.ts`.
 */
export function PlaceholderChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--color-violet)_32%,transparent)] px-2.5 py-1",
        className,
      )}
      title="Replace this entry in src/data/profile.ts"
    >
      <span className="h-1 w-1 rounded-full bg-[var(--color-violet)]" />
      <span className="font-mono text-[0.5625rem] leading-none tracking-[0.2em] text-[var(--color-violet)]">
        PLACEHOLDER
      </span>
    </span>
  );
}
