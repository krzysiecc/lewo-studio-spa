// components/Hero.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function Hero() {
  const bigNameRef = useRef<HTMLHeadingElement>(null);
  const smallNameRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.fromTo(
      bigNameRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
    );

    gsap.fromTo(
      smallNameRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.inOut", delay: 0.5 }
    );
  }, []);

  return (
    <section className="-z-10 relative min-h-screen bg-bluepowder-700 text-seashell-100 flex flex-col justify-between">
      {/* CENTERED MAIN BLOCK */}
      <div className="flex-grow flex items-center w-full">
        <div className="layout-grid grid-cols-12 gap-4 w-full">
          {/* Left: Name block */}
          <div className="z-10 col-span-12 md:col-start-3 md:col-span-4 flex flex-col items-start text-left space-y-2 font-antonio">
            <div ref={bigNameRef}>
              <h1
                className="font-bold tracking-tight leading-tight"
                style={{
                  fontSize: "clamp(3rem, 10vw, 10rem)",
                  lineHeight: 1.05,
                }}
              >
                lena
                <br />
                wojewódzka
              </h1>
            </div>
          </div>

          {/* Right: Subtitle */}
          <div className="col-span-12 md:col-start-7 md:col-span-4 flex items-end justify-end">
            <span
              ref={smallNameRef}
              className="text-m md:text-base font-light tracking-wider text-right"
            >
              interior design
            </span>
          </div>
        </div>
      </div>

      {/* SOME TEXT ZONE */}
      <div className="layout-grid grid-cols-12 gap-4 w-full pb-20">
        <div className="col-span-12 md:col-start-2 md:col-span-10">
          <p className="text-sm md:text-base leading-relaxed">
            currently working on a curated collection of elegant, functional
            living spaces. from soft minimalism to bold personality-driven
            forms.
          </p>
        </div>
      </div>

      {/* SCROLL DOWN HINT */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
        <p className="opacity-60 text-xs tracking-wide uppercase">
          scroll down
        </p>
      </div>
    </section>
  );
}
