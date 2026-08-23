"use client";

import { useSyncExternalStore } from "react";
import { profile } from "@/data/profile";

function format(): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: profile.timezone,
    }).format(new Date());
  } catch {
    // An invalid IANA zone in profile.ts should degrade, not crash the hero.
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  }
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

/**
 * Decorative interface metadata — the visitor sees Aniket's local time.
 * Read through `useSyncExternalStore` so the server renders a neutral
 * placeholder and hydration can never mismatch.
 */
export function LocalTime() {
  const time = useSyncExternalStore(subscribe, format, () => null);

  return (
    <span className="label label-bright tabular-nums">
      {time ? `${time} ${profile.timezoneLabel}` : "--:--"}
    </span>
  );
}
