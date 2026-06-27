// components/effects/FilamentBulbs.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useMemo } from "react";

interface FilamentBulbsProps {
  /** How many bulbs to scatter across the parent. */
  count?: number;
  /** Smallest / largest bulb diameter, in px. */
  minSize?: number;
  maxSize?: number;
  className?: string;
}

interface Bulb {
  id: string;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

/**
 * A field of randomly-twinkling filament bulbs (warm ring + yellow glow) used
 * as a "light only" accent layer. Each bulb gets a one-time randomized twinkle
 * delay/duration so they flicker independently like little incandescent lamps.
 * Purely decorative — `pointer-events-none`, animated with CSS (no per-frame JS).
 */
export default function FilamentBulbs({
  count = 24,
  minSize = 4,
  maxSize = 11,
  className = "",
}: FilamentBulbsProps) {
  const bulbs = useMemo<Bulb[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: `bulb-${i}-${Math.random().toString(36).slice(2, 8)}`,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: minSize + Math.random() * (maxSize - minSize),
        // Negative delay so they're already mid-cycle on mount (no synced flash).
        delay: -Math.random() * 6,
        duration: 2.6 + Math.random() * 3.6,
      })),
    [count, minSize, maxSize],
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {bulbs.map((b) => (
        <span
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            transform: "translate(-50%, -50%)",
            border: "1px solid rgba(255, 214, 150, 0.45)",
            background:
              "radial-gradient(circle, rgba(255,224,165,0.95) 0%, rgba(255,186,96,0.35) 45%, transparent 72%)",
            boxShadow:
              "0 0 6px 1px rgba(255,201,120,0.55), 0 0 16px 3px rgba(255,170,70,0.28)",
            animation: `bulbTwinkle ${b.duration}s ease-in-out ${b.delay}s infinite`,
            willChange: "opacity",
          }}
        />
      ))}
    </div>
  );
}
