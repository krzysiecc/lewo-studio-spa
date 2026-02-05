// components/MenuOverlay.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import React, { useRef, useEffect, type CSSProperties } from "react";

interface MagnetQuadraticProps {
  rows?: number;
  columns?: number;
  containerSize?: string;
  containerWidth?: string;
  containerHeight?: string;
  itemSize?: string;
  baseAngle?: number;
  className?: string;
  style?: CSSProperties;
  /** The color of the items (HSL hue) - default is 210 (Slate Blue) */
  baseHue?: number;
}

const MagnetQuadratic: React.FC<MagnetQuadraticProps> = ({
  rows = 12,
  columns = 12,
  containerSize = "80vmin",
  containerWidth,
  containerHeight,
  itemSize = "4vmin",
  baseAngle = 0,
  className = "",
  // eslint-disable-next-line react-x/no-unstable-default-props
  style = {},
  baseHue = 90,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLDivElement>(".magnet-item");

    const onPointerMove = (pointer: { x: number; y: number }) => {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;

        const b = pointer.x - centerX;
        const a = pointer.y - centerY;
        const c = Math.sqrt(a * a + b * b) || 1;

        // Calculate rotation angle
        const r =
          ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > centerY ? 1 : -1);

        // Calculate distance factor (0 to 1) for proximity effects
        // We normalize distance based on window width for consistency
        const dist = Math.min(c, window.innerWidth) / window.innerWidth;

        item.style.setProperty("--rotate", `${r}deg`);
        item.style.setProperty("--rotate-num", `${r}`);
        item.style.setProperty("--distance", `${dist}`);
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      onPointerMove({ x: e.x, y: e.y });
    };

    window.addEventListener("pointermove", handlePointerMove);

    // Initial positioning
    if (items.length) {
      const middleIndex = Math.floor(items.length / 2);
      const rect = items[middleIndex].getBoundingClientRect();
      onPointerMove({ x: rect.x, y: rect.y });
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const total = rows * columns;
  const items = Array.from({ length: total }, (_, i) => (
    <div
      key={i}
      className="magnet-item block origin-center"
      style={{
        width: itemSize,
        height: itemSize,
        // Default CSS variable values
        ["--rotate" as string]: `${baseAngle}deg`,
        ["--rotate-num" as string]: `${baseAngle}`,
        ["--distance" as string]: "1",

        // --- ARCHITECTURAL STYLE ---
        // We use the rotation to calculate Lightness (L) in HSL, creating a shimmering effect
        backgroundColor: `hsla(${baseHue}, 20%, calc(20% + (var(--rotate-num) / 360 * 40%)), 0.8)`,

        // Border gives it the structural/wireframe look
        border: `1px solid hsla(${baseHue}, 50%, 60%, 0.4)`,

        // Shadow adds depth based on rotation
        boxShadow: `0 4px 10px hsla(${baseHue}, 50%, 5%, 0.2)`,

        // Standard transforms
        transform: "rotate(var(--rotate)) scale(0.9)", // slightly scaled down to allow rotation clearance
        borderRadius: "4px", // Slight rounding for elegance

        // Performance optimizations
        willChange: "transform, background-color",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`grid place-items-center ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerWidth ?? containerSize,
        height: containerHeight ?? containerSize,
        gap: "1vmin",
        perspective: "1000px",
        ...style,
      }}
    >
      {items}
    </div>
  );
};

export default MagnetQuadratic;
