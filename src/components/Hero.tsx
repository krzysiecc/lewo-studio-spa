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
    <section className="relative min-h-screen bg-coffee-800 text-seashell-200 px-4 py-10 flex flex-col justify-between">
      <div className="layout-grid grid-cols-12 gap-4">
        <div className="col-span-12 h-[10rem]"></div>

        {/* Name Block */}
        <div className="col-span-12 md:col-start-2 md:col-span-10 flex flex-col justify-center items-start z-10 font-antonio space-y-1">
          <div ref={bigNameRef}>
            <h1
              className="font-bold tracking-tight leading-tight"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 8rem)",
                lineHeight: 1.1,
              }}
            >
              lena
              <br />
              wojewódzka
            </h1>
          </div>

          <span
            ref={smallNameRef}
            className="text-lg font-light tracking-wider text-right w-full text-coffee-500"
          >
            interior design
          </span>
        </div>

        {/* IMAGE CAROUSEL */}
        <div className="col-span-12 mt-10 justify-center text-center">
          mimimi
        </div>
      </div>

      {/* Scroll Down Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <p className="opacity-60 text-xs tracking-wide">scroll down</p>
      </div>
    </section>
  );
}
