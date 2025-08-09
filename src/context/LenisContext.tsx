// context/LenisContext.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "@studio-freight/lenis";

// 1. The context will now provide a RefObject containing Lenis or null
const LenisContext = createContext<React.RefObject<Lenis | null> | null>(null);

// 2. The provider component
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      lerp: 0.1,
    });
    console.log("✅ Lenis instance created in Provider.");
    lenisRef.current = lenis;

    // The animation loop
    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      console.log("❌ Lenis instance destroyed in Provider.");
    };
  }, []);

  // Provide the entire ref object
  return (
    <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>
  );
}

// 3. The custom hook for easy access
export function useSharedLenis() {
  const context = useContext(LenisContext);
  if (context === null) {
    // Note the change to null check
    throw new Error("useSharedLenis must be used within a LenisProvider");
  }
  return context;
}
