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
  const smallNameRef = useRef<HTMLHeadingElement>(null);

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
    <section className="relative min-h-screen bg-seashell-200 text-coffee-800 px-4 py-10 flex flex-row justify-center">
      <div className="layout-grid grid-cols-12 gap-4 flex-grow">
        {/* Centered Name Block */}
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

          {/* interior design label */}
          <span
            ref={smallNameRef}
            className="text-lg font-light tracking-wider text-right w-full text-coffee-500"
          >
            interior design
          </span>
        </div>

        {/* Right-side block */}
        <div className="hidden md:flex flex-col col-start-8 col-span-3 space-y-2 text-sm leading-relaxed z-10 text-right pt-24">
          <p className="text-coffee-800">
            ...siema siema kurwa witam Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Nobis, dolor illo quis qui earum beatae at tenetur
            unde! Animi, delectus quisquam culpa minus tenetur sint ea, quos ex
            velit ipsa dolorum voluptatibus sapiente perspiciatis fugit
            obcaecati officiis eaque tempore provident, ullam vitae. Fugiat rem
            explicabo numquam temporibus similique, reiciendis esse?
          </p>
        </div>
      </div>

      {/* Footer Scroll Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <p className="opacity-60 text-xs tracking-wide">scroll down</p>
      </div>
    </section>
  );
}
