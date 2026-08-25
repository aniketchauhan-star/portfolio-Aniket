"use client";

import { useCallback, useRef, useState } from "react";
import { Maximize2, Play } from "lucide-react";
import { ProjectVisual } from "./ProjectVisual";
import { useIsTouch } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export interface GameFrameProps {
  src: string;
  title: string;
  poster?: string;
  aspect?: string;
  /** Control hint under the frame. Defaults to an arrow-keys/WASD build. */
  controls?: { pointer: string; touch: string };
}

/**
 * A playable build embedded in the project overlay.
 *
 * The build is not loaded until the visitor asks for it — a few megabytes of
 * sprites and audio should never download just because someone opened a
 * project page. Until then this is a poster with a play control.
 *
 * No `sandbox` attribute: the build is our own first-party code on our own
 * origin, and `allow-scripts allow-same-origin` — which it needs, since it
 * persists the chosen character, best score and unlocked levels — is a
 * combination the browser itself warns is equivalent to no sandbox at all.
 */
const DEFAULT_CONTROLS = {
  pointer: "ARROW KEYS / WASD · SPACE",
  touch: "ON-SCREEN CONTROLS · LANDSCAPE",
};

export function GameFrame({
  src,
  title,
  poster,
  aspect = "16 / 9",
  controls = DEFAULT_CONTROLS,
}: GameFrameProps) {
  // Cap the frame's width so its derived height always fits the viewport.
  // On a landscape phone a full-width 16:9 frame is taller than the screen,
  // which would mean scrolling the page while trying to play.
  const ratio = (() => {
    const [w, h] = aspect.split("/").map((n) => Number(n.trim()));
    return Number.isFinite(w) && Number.isFinite(h) && h > 0 ? w / h : 16 / 9;
  })();
  const [started, setStarted] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  /** Enter fullscreen and, where the browser allows it, lock to landscape. */
  const enterFullscreen = useCallback(async () => {
    const el = shell.current;
    if (!el || document.fullscreenElement) return;
    try {
      await el.requestFullscreen();
    } catch {
      // Safari on iPhone refuses fullscreen on non-video elements; the game
      // still plays inline, so there is nothing to recover from.
      return;
    }
    // Best-effort: most engines only honour this while actually fullscreen.
    try {
      await (
        screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        }
      ).lock?.("landscape");
    } catch {
      /* Orientation lock is unsupported or rejected — the game's own rotate
         prompt covers the portrait case. */
    }
  }, []);

  const start = useCallback(() => {
    setStarted(true);

    // Every build here is a landscape game. On a phone, playing it in a
    // letterboxed strip inside a scrolling overlay is not really playing it —
    // so the same tap that starts the build also asks for fullscreen. It has
    // to happen inside this handler: `requestFullscreen` is only granted
    // during a user gesture, so deferring it to a second tap is the difference
    // between it working and it being rejected outright.
    if (isTouch) void enterFullscreen();

    // Bring the frame fully into view — the build is 16:9 and taller than
    // what is left of the overlay once the header and title are on screen.
    requestAnimationFrame(() =>
      shell.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, [isTouch, enterFullscreen]);

  const goFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* Already left fullscreen by some other route. */
      }
      return;
    }
    await enterFullscreen();
  }, [enterFullscreen]);

  return (
    <div className="relative">
      <div
        ref={shell}
        className="edge relative mx-auto w-full overflow-hidden rounded-2xl bg-black"
        style={{
          aspectRatio: aspect,
          maxWidth: `calc((100svh - 7rem) * ${ratio})`,
        }}
      >
        {started ? (
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; autoplay; gamepad"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <>
            <ProjectVisual src={poster} alt={title} />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 70% at 50% 50%, rgba(3,4,7,0.35) 0%, rgba(3,4,7,0.82) 100%)",
              }}
            />
            <button
              type="button"
              onClick={start}
              data-cursor="view"
              className="group absolute inset-0 flex flex-col items-center justify-center gap-5"
              aria-label={`Play ${title}`}
            >
              <span
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full border transition-all duration-500",
                  "border-[color-mix(in_oklab,var(--color-cyan)_40%,transparent)] bg-[rgba(108,243,255,0.07)]",
                  "group-hover:scale-105 group-hover:bg-[rgba(108,243,255,0.14)]",
                )}
                style={{ boxShadow: "0 0 60px -12px rgba(108,243,255,0.6)" }}
              >
                <Play
                  size={26}
                  strokeWidth={1.3}
                  className="ml-1 text-[var(--color-cyan)]"
                  fill="currentColor"
                />
              </span>
              <span className="label label-bright">
              {isTouch ? "PLAY FULLSCREEN" : "PLAY IN BROWSER"}
            </span>
            </button>
          </>
        )}
      </div>

      {/* Controls sit under the frame so they never cover the game. */}
      <div className="mx-auto mt-4 flex w-full flex-wrap items-center gap-x-6 gap-y-1"
        style={{ maxWidth: `calc((100svh - 7rem) * ${ratio})` }}
      >
        {started && (
          <button
            type="button"
            onClick={goFullscreen}
            data-cursor="link"
            className="group inline-flex min-h-[44px] items-center gap-2"
          >
            <Maximize2 size={13} strokeWidth={1.5} className="text-[var(--color-cyan)]" />
            <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
              FULLSCREEN
            </span>
          </button>
        )}

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="open"
          className="group inline-flex min-h-[44px] items-center gap-2"
        >
          <span className="label label-bright transition-colors duration-400 group-hover:text-[var(--color-ink)]">
            OPEN IN NEW TAB
          </span>
          <span className="text-[var(--color-cyan)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45">
            ↗
          </span>
        </a>

        <p className="label w-full sm:w-auto">
          {isTouch ? controls.touch : controls.pointer}
        </p>
      </div>
    </div>
  );
}
