// pages/ContactPage.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-seashell-100 text-coffee-900">
      <div className="layout-grid py-24">
        <div className="col-span-12 md:col-span-6">
          <h1 className="font-antonio text-5xl md:text-7xl lowercase">
            {t("contactPage.heading")}
          </h1>
          <p className="mt-4 max-w-md text-coffee-700">
            {t("contactPage.body")}
          </p>
          {/* TODO: add social links here */}
        </div>
        <div className="col-span-12 md:col-span-6">
          {/* TODO: replace with a React Bits form */}
          <div className="bg-white/60 rounded-xl p-6 shadow-lg">
            <p className="font-mono text-sm text-coffee-700/80">
              {t("contactPage.formComingSoon")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
