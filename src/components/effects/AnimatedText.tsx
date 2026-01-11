// components/FX/AnimatedText.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { AnimatePresence, motion } from "framer-motion";
import React, { type ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  text: string;
  el?: React.ElementType;
  className?: string;
}

export default function AnimatedText({
  children,
  text,
  el = "span",
  className,
}: AnimatedTextProps) {
  const childContent = (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        // Large padding to contain the glow without hard clipping near the text
        padding: "1.5em 1em",
        margin: "-1.5em -1em",
        verticalAlign: "bottom",
        // Soft mask to fade out the glow at the far edges instead of a hard cut
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ y: "120%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-120%", opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "circOut" }}
          style={{ display: "inline-block" }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );

  return React.createElement(el, { className }, childContent);
}
