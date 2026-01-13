// App.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { LenisProvider } from "./context/LenisProvider";

// Pages
import HomePage from "./pages/home/HomePage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import ContactPage from "./pages/contact/ContactPage";

import ProjectKNSSD from "./pages/projects/KNSSD";

export default function App() {
  return (
    <LenisProvider>
      <main>
        {/* The Layout component wraps Routes, so the Global Header persists */}
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/projects/2025-knssd" element={<ProjectKNSSD />} />
          </Routes>
        </Layout>
      </main>
    </LenisProvider>
  );
}
