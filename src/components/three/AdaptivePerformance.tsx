"use client";

import { useCallback, useRef } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import type { Tier } from "@/lib/quality";

const ORDER: Tier[] = ["high", "medium", "low"];

/**
 * Watches real frame timing and steps the quality tier down if the initial
 * hardware guess was optimistic. It never steps back up — oscillating between
 * tiers is more distracting than simply running one notch lower.
 */
export function AdaptivePerformance({
  tier,
  onTier,
}: {
  tier: Tier;
  onTier: (t: Tier) => void;
}) {
  const cooling = useRef(false);

  const downgrade = useCallback(() => {
    if (cooling.current) return;
    const next = ORDER[Math.min(ORDER.indexOf(tier) + 1, ORDER.length - 1)];
    if (next === tier) return;
    cooling.current = true;
    onTier(next);
    // Give the new tier a few seconds to settle before judging it again.
    window.setTimeout(() => {
      cooling.current = false;
    }, 4000);
  }, [tier, onTier]);

  return (
    <PerformanceMonitor
      bounds={() => [46, 58]}
      flipflops={3}
      onDecline={downgrade}
      onFallback={downgrade}
    />
  );
}
