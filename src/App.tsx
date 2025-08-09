// src/App.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import Layout from "./components/Layout";
import Hero from "./components/Hero";
import RevealProject from "./components/RevealProject";
import MainProjects from "./components/MainProject";
import { LenisProvider } from "./context/LenisContext";

export default function App() {
  return (
    <LenisProvider>
      <main>
        <Layout>
          <Hero />

          <RevealProject />

          <MainProjects />
        </Layout>
      </main>
    </LenisProvider>
  );
}
