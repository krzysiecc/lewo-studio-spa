// components/FX/AnimatedText.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { AnimatePresence, motion } from "framer-motion";
import React, { type ReactNode } from "react";

type AnimatedTextProps = {
  children: ReactNode;
  text: string;
  el?: React.ElementType;
  className?: string;
};

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
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-110%" }}
          transition={{ duration: 0.4, ease: "circOut" }}
          style={{ display: "inline-block" }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );

  return React.createElement(el, { className }, childContent);
}
