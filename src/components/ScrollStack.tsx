// components/MenuOverlay.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import React, {
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useSharedLenis } from "@/hooks/useSharedLenis";

// --- Types ---

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

interface TransformState {
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
}

interface LenisInstance {
  scroll: number;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
}

// --- Components ---

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative w-full h-80 my-8 p-12 rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.1)] box-border origin-top will-change-transform bg-white border border-gray-100 ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
      // Important: We start with translateZ(0) to force GPU layer
      transform: "translateZ(0)",
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number; // Distance between items in the DOM layout
  itemScale?: number; // How much smaller each item gets
  itemStackDistance?: number; // Distance between items when they are "stacked"
  stackPosition?: string; // Where on screen (percentage) the stack starts
  scaleEndPosition?: string; // Where scaling ends
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.05,
  itemStackDistance = 25,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.9,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}) => {
  const lenisRef = useSharedLenis();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, TransformState>());
  const stackCompletedRef = useRef(false);
  const isUpdatingRef = useRef(false);

  // --- Helpers ---

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    [],
  );

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(String(value));
    },
    [],
  );

  // Gets the top position of an element relative to the document
  const getElementOffset = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return rect.top + scrollTop;
  }, []);

  // --- Core Logic ---

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    if (!containerRef.current) return;

    isUpdatingRef.current = true;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerHeight = window.innerHeight;

    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(
      scaleEndPosition,
      containerHeight,
    );

    // We look for the end marker to know where to stop pinning
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const endElement = containerRef.current.querySelector(
      ".scroll-stack-end",
    ) as HTMLElement | null;

    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card);

      // LOGIC:
      // triggerStart: Point where card enters the "stack zone"
      // pinEnd: Point where the entire container has finished scrolling

      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;

      // Calculate where this specific card stops being pinned.
      // Usually, it's the bottom of the container minus the viewport height
      const pinEnd = endElementTop - containerHeight;

      const triggerStart = pinStart;
      const triggerEnd = cardTop - scaleEndPositionPx;

      const scaleProgress = calculateProgress(
        scrollTop,
        triggerStart,
        triggerEnd,
      );

      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      // Blur Logic
      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        // Find which card is currently at the "front"
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCard = cardsRef.current[j];
          if (!jCard) continue;
          const jCardTop = getElementOffset(jCard);
          const jTriggerStart =
            jCardTop - stackPositionPx - itemStackDistance * j;

          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        // Blur cards that are behind the top card
        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      // Translation (Pinning) Logic
      // Instead of CSS sticky, we manually translate Y to counteract scroll
      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        // While pinned, move down with the scroll
        translateY =
          scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        // After pin finishes, hold it at the bottom position
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      // Optimize values
      const newValues: TransformState = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      // Apply changes only if diff is significant (Performance)
      const lastValues = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastValues ||
        Math.abs(lastValues.translateY - newValues.translateY) > 0.1 ||
        Math.abs(lastValues.scale - newValues.scale) > 0.001 ||
        Math.abs(lastValues.rotation - newValues.rotation) > 0.1 ||
        Math.abs(lastValues.blur - newValues.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newValues.translateY}px, 0) scale(${newValues.scale}) rotate(${newValues.rotation}deg)`;
        const filter =
          newValues.blur > 0 ? `blur(${newValues.blur}px)` : "none";

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newValues);
      }

      // Stack Complete Callback logic
      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getElementOffset,
  ]);

  // --- Layout Effect (Setup) ---

  useLayoutEffect(() => {
    if (containerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const cards = Array.from(
        containerRef.current.querySelectorAll(".scroll-stack-card"),
      ) as HTMLElement[];

      cardsRef.current = cards;

      cards.forEach((card, i) => {
        // Set initial margins for natural document flow
        if (i < cards.length - 1) {
          card.style.marginBottom = `${itemDistance}px`;
        }
        card.style.willChange = "transform, filter";
        card.style.transformOrigin = "top center";
      });
    }

    // Initial calculation
    updateCardTransforms();

    const transformMap = lastTransformsRef.current;

    return () => {
      cardsRef.current = [];
      transformMap.clear();
    };
  }, [itemDistance, children, updateCardTransforms]);

  // --- Effect (Lenis & Resize Binding) ---

  useEffect(() => {
    const lenis = lenisRef?.current as unknown as LenisInstance | null;

    // Fallback if Lenis isn't ready immediately
    const handleScroll = () => updateCardTransforms();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    if (lenis) {
      lenis.on("scroll", handleScroll);
    }

    // Optional: RAF loop for smoother interpolation if needed,
    // but usually on('scroll') is sufficient with Lenis.
    let rafId: number;
    const loop = () => {
      updateCardTransforms();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (lenis) lenis.off("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [lenisRef, updateCardTransforms]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      {/* This inner container ensures centering. 
        pb-[50vh] gives extra scroll room at the bottom so the last card can "unpin" gracefully 
      */}
      <div className="scroll-stack-inner flex flex-col items-center w-full relative z-10">
        {children}
      </div>

      {/* This element dictates how long the "Pin" lasts. 
         Making this taller increases the duration the cards stay stacked.
      */}
      <div className="scroll-stack-end w-full h-[50vh]" />
    </div>
  );
};

export default ScrollStack;
