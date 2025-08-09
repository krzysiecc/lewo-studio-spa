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
  const textTopRef = useRef<HTMLHeadingElement>(null);
  const textBottomRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (
      !containerRef.current ||
      !circleRef.current ||
      !textTopRef.current ||
      !textBottomRef.current
    )
      return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(
        circleRef.current,
        {
          scale: 20,
          ease: "none",
        },
        0
      );

      tl.fromTo(
        textTopRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", ease: "power2.inOut" },
        0.2
      );

      tl.fromTo(
        textBottomRef.current,
        { opacity: 0 },
        { opacity: 1, ease: "power2.in" },
        0.6
      );

      tl.to(
        [textTopRef.current, textBottomRef.current],
        {
          opacity: 0,
          ease: "none",
        },
        1.2
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center bg-seashell-100 overflow-hidden"
      >
        {/* SVG Circle that grows */}
        <svg
          ref={circleRef}
          className="absolute w-[10rem] h-[10rem] z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: "scale(1)", willChange: "transform" }}
        >
          <circle cx="50" cy="50" r="50" className="fill-thulian-300/95" />
        </svg>

        {/* Text that appears ON TOP of the circle */}
        <div className="absolute z-20 text-center text-seashell-100 pointer-events-none">
          <h2
            ref={textTopRef}
            className="text-4xl md:text-6xl font-extrabold"
            style={{ clipPath: "inset(0 100% 0 0)" }} // Initial state for animation
          >
            Exploring the Projects
          </h2>
          <p
            ref={textBottomRef}
            className="text-lg mt-4 opacity-0" // Initial state for animation
          >
            A journey through curated spaces.
          </p>
        </div>
      </section>
    </>
  );
}
