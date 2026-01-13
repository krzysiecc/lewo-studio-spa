// pages/ProjectsPage.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useTranslation } from "react-i18next";

export default function ProjectsPage() {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-neutral-950 text-seashell-100">
      <div className="layout-grid grid grid-cols-12 gap-4 md:gap-6 py-24">
        <div className="col-span-12 md:col-span-6">
          <h1 className="font-urbanist text-5xl md:text-7xl text-avocado-400 text-glow lowercase">
            {t("projectsPage.heading")}
          </h1>
          <p className="mt-6 max-w-xl text-seashell-200/80 font-space-mono text-sm">
            {t("projectsPage.body")}
          </p>
        </div>
        <div className="col-span-12 md:col-span-6">
          <div className="mb-8">
            <h2 className="font-urbanist text-3xl text-avocado-400 text-glow lowercase mb-4">
              KNSSD
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
