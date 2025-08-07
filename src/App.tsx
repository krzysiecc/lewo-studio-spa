// src/App.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import Overlay from "./components/Overlay";
import Hero from "./components/Hero";

import RevealProject from "./components/RevealProject";
import MainProjects from "./components/MainProject";

import { useLenis } from "./hooks/useLenis";

export default function App() {
  useLenis();

  return (
    <main>
      <Overlay />

      <Hero />

      <RevealProject />

      <MainProjects />
    </main>
  );
}
