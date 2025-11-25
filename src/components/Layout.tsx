// components/Layout.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import React, { useState } from "react";
import Header from "./layout/Header";
// import Chatbot from "./layout/Chatbot";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Header floats on top */}
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* <Chatbot isMenuOpen={isMenuOpen} /> */}

      {/* The main content area has padding, creating the "frame" */}
      <main className="relative z-0">{children}</main>
    </>
  );
}
