"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

/**
 * Landscape-only gate for handheld devices.
 *
 * The whole site is designed to be viewed in landscape, so a touch device held
 * in portrait gets a full-screen prompt instead of the page. Desktops are
 * never gated — a tall browser window is not a rotated device, and there would
 * be no way for the visitor to comply.
 *
 * Rendered from a client effect only, so the server never ships markup that
 * would flash for desktop visitors.
 */
export function OrientationGate() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // `pointer: coarse` keeps this to phones and tablets.
    const mql = window.matchMedia("(orientation: portrait) and (pointer: coarse)");

    const apply = () => {
      setBlocked(mql.matches);
      // An attribute, not an inline style: the preloader clears
      // `style.overflow` when it finishes, which would silently unlock the
      // page behind the gate.
      document.documentElement.toggleAttribute("data-locked", mql.matches);
    };

    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      document.documentElement.removeAttribute("data-locked");
    };
  }, []);

  if (!blocked) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Rotate your device"
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-10 bg-[#030407] px-8 text-center"
    >
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.04em]">
        {profile.monogram}
      </span>

      {/* A phone turning on its side. */}
      <span aria-hidden className="og-phone">
        <span className="og-phone__body">
          <span className="og-phone__screen" />
        </span>
      </span>

      <div className="flex flex-col items-center gap-3">
        <h1 className="display-md">ROTATE YOUR DEVICE</h1>
        <p className="label label-bright max-w-[34ch] leading-[2]">
          THIS EXPERIENCE IS BUILT FOR LANDSCAPE
        </p>
      </div>

      <style>{`
        .og-phone {
          display: grid;
          place-items: center;
          width: 96px;
          height: 96px;
        }
        .og-phone__body {
          display: block;
          width: 46px;
          height: 78px;
          border: 1px solid rgba(108,243,255,0.5);
          border-radius: 9px;
          padding: 7px 5px;
          box-shadow: 0 0 34px -8px rgba(108,243,255,0.55);
          animation: ogTurn 2.8s cubic-bezier(0.65,0,0.35,1) infinite;
        }
        .og-phone__screen {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(140deg, rgba(108,243,255,0.30), rgba(132,107,255,0.18));
        }
        @keyframes ogTurn {
          0%, 26%   { transform: rotate(0deg); }
          58%, 100% { transform: rotate(-90deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .og-phone__body { animation: none; transform: rotate(-90deg); }
        }
      `}</style>
    </div>
  );
}
