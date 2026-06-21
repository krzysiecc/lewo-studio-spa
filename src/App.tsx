// App.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { LenisProvider } from "./context/LenisProvider";

// Pages — lazy-loaded so each route ships as its own code-split chunk
const HomePage = lazy(() => import("./pages/home/HomePage"));
const ProjectsPage = lazy(() => import("./pages/projects/ProjectsPage"));
const ContactPage = lazy(() => import("./pages/contact/ContactPage"));
const ProjectKNSSD = lazy(() => import("./pages/projects/KNSSD"));

export default function App() {
  return (
    <LenisProvider>
      <main>
        {/* The Layout component wraps Routes, so the Global Header persists */}
        <Layout>
          {/* Suspense sits inside Layout so only the page area waits on a
              chunk load — the header/menu stay mounted during navigation */}
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />

              <Route path="/projects/2025-knssd" element={<ProjectKNSSD />} />
            </Routes>
          </Suspense>
        </Layout>
      </main>
    </LenisProvider>
  );
}
