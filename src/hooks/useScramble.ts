// hooks/useScramble.ts

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>";

interface ScrambleOptions {
  /** Total duration of the decode animation, in milliseconds. */
  duration?: number;
  /** Character set used for the random "noise" glyphs. */
  glyphs?: string;
}

/**
 * Random letter-swap (decode) text effect.
 *
 * Returns the current `display` string and a `scrambleTo(target)` trigger that
 * animates from the current text to `target`: every not-yet-locked character
 * flickers through random glyphs while characters lock in left-to-right over
 * `duration`. RAF-driven, dependency-free.
 */
export function useScramble(initial: string, options: ScrambleOptions = {}) {
  const { duration = 600, glyphs = DEFAULT_GLYPHS } = options;

  const [display, setDisplay] = useState(initial);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const randGlyph = useCallback(
    () => glyphs[Math.floor(Math.random() * glyphs.length)],
    [glyphs],
  );

  const scrambleTo = useCallback(
    (target: string) => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
      const len = target.length;

      const tick = (now: number) => {
        startRef.current ??= now;
        const progress = Math.min((now - startRef.current) / duration, 1);
        // Characters lock in from the left as progress advances.
        const locked = Math.floor(progress * len);

        let out = "";
        for (let i = 0; i < len; i++) {
          out += i < locked ? target[i] : randGlyph();
        }
        setDisplay(out);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(target);
          frameRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    [duration, randGlyph],
  );

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return { display, scrambleTo };
}
