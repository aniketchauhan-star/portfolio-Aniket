import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Project preview. When no image has been supplied we render an intentional
 * designed panel rather than borrowing a stock photograph — an empty slot
 * should still look like part of the system.
 *
 * Drop real files in `public/projects/` (e.g. `project-01.webp`) and point the
 * project's `image` field at `/projects/project-01.webp`.
 */
export function ProjectVisual({
  src,
  alt,
  className,
  priority = false,
  /**
   * Passed straight to next/image. The default describes a full-width card
   * (the project overlay); a tile in the work grid is a third of that at most,
   * so the grid passes its own value rather than downloading a hero-sized
   * image for a 170px thumbnail.
   */
  sizes = "(max-width: 768px) 92vw, (max-width: 1280px) 78vw, 68vw",
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-label={`${alt} — visual coming soon`}
      role="img"
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden",
        className,
      )}
      style={{
        background:
          "radial-gradient(120% 90% at 30% 0%, rgba(108,243,255,0.07) 0%, transparent 58%)," +
          "radial-gradient(100% 80% at 80% 100%, rgba(132,107,255,0.07) 0%, transparent 60%)," +
          "#06080e",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(244,246,255,0.032) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(244,246,255,0.032) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 50%, #000 10%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 70% at 50% 50%, #000 10%, transparent 80%)",
        }}
      />
      <span
        aria-hidden
        className="relative block h-14 w-14 rotate-45 rounded-[22%] border border-[rgba(108,243,255,0.16)]"
      >
        <span className="absolute inset-[38%] rounded-full bg-[rgba(108,243,255,0.35)] blur-[2px]" />
      </span>
      <div className="relative flex flex-col items-center gap-1.5">
        <span className="label label-bright">PROJECT VISUAL</span>
        <span className="label">COMING SOON</span>
      </div>
    </div>
  );
}
