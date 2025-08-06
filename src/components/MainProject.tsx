// components/MainProject.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

export default function MainProject() {
  return (
    <section className="min-h-screen bg-coffee-600 text-seashell-100 p-20 grid grid-cols-12 gap-8 z-10 relative">
      <div className="col-span-12 md:col-span-6">
        <h2 className="text-5xl font-bold mb-6">Projects</h2>
        <p className="text-lg leading-relaxed max-w-xl">
          A selection of design work that reflects diversity, bold creativity,
          and functional interior thinking.
        </p>
      </div>

      <div className="col-span-12 md:col-span-6 space-y-4">
        <div className="bg-avocado p-6 text-white rounded-lg">
          Modern Living
        </div>
        <div className="bg-bluepowder p-6 text-coffee rounded-lg">
          Boho Kitchen
        </div>
      </div>
    </section>
  );
}
