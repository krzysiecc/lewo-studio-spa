// App.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LenisProvider } from "./context/LenisContext";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  return (
    <LenisProvider>
      <main>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
      </main>
    </LenisProvider>
  );
}
