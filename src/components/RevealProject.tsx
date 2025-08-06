// components/RevealProject.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RevealProject() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGSVGElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !circleRef.current || !nextRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Animate circle and next section in parallel
      tl.to(
        circleRef.current,
        {
          scale: 60,
          transformOrigin: "50% 50%",
          ease: "none",
        },
        0
      ); // start immediately

      tl.fromTo(
        nextRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: "power2.out" },
        0.2 // starts slightly after
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Reveal Transition Section */}
      <section
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center bg-seashell-100 overflow-hidden"
      >
        {/* SVG Circle */}
        <svg
          ref={circleRef}
          className="absolute w-[100px] h-[100px] z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: "scale(1)",
            willChange: "transform",
          }}
        >
          <circle cx="50" cy="50" r="50" fill="#6c4d3f" />
        </svg>
      </section>

      {/* Next Section (projects intro?) */}
      <section
        ref={nextRef}
        className="min-h-screen bg-coffee-900 text-seashell-100 flex items-center justify-center text-4xl font-bold"
      >
        This is the Projects section.
      </section>
    </>
  );
}
