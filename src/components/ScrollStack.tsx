// src/components/ScrollStack.tsx

// MODIFIED
// src/components/ImageSequence.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import React from "react";
import type { ReactNode } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card absolute top-0 left-0 right-0 mx-auto w-full h-80 p-12 rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.1)] box-border origin-top will-change-transform bg-white border border-gray-100 ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
}

// We use forwardRef to allow the parent to grab the container if needed
const ScrollStack = ({
  ref,
  children,
  className = "",
}: ScrollStackProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div
      ref={ref}
      className={`scroll-stack-container relative w-full h-full max-w-2xl mx-auto ${className}`.trim()}
    >
      {children}
    </div>
  );
};

ScrollStack.displayName = "ScrollStack";
export default ScrollStack;
