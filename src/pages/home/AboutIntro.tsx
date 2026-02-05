// components/home/AboutIntro.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import AnimatedText from "../../components/effects/AnimatedText";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function AboutIntro() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Ref for the "Global Tilt" quickSetter
  const tiltRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(
    null,
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const rooms = gsap.utils.toArray<HTMLElement>(".intro-room");

      if (!container) return;

      // 1. SETUP: Deep perspective
      gsap.set(container, { perspective: 2500, transformStyle: "preserve-3d" });

      // 2. ENTRANCE: "Cinematic Assemble"
      // Faster, smoother, sweeping in from sides (X axis)
      gsap.fromTo(
        rooms,
        {
          opacity: 0,
          scale: 0.8,
          z: -200, // Slight depth push
          x: (i) => (i % 2 === 0 ? -150 : 150), // Split: Evens left, Odds right
          rotationX: 30, // Slight tilt up
          y: 50,
        },
        {
          opacity: 1,
          scale: 1,
          z: 0,
          x: 0,
          y: 0,
          rotationX: 0,
          duration: 1.4, // Faster
          ease: "power4.out", // Elegant slowdown (no bounce)
          stagger: {
            amount: 0.4, // Quick succession
            from: "center",
          },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => {
            setupTilt();
          },
        },
      );

      // 3. GLOBAL TILT SETUP
      function setupTilt() {
        if (!container) return;

        tiltRef.current = {
          x: gsap.quickTo(container, "rotationY", {
            duration: 0.8,
            ease: "power3.out",
          }),
          y: gsap.quickTo(container, "rotationX", {
            duration: 0.8,
            ease: "power3.out",
          }),
        };
      }

      // 4. MOUSE HANDLER
      const handleMouseMove = (e: MouseEvent) => {
        if (!tiltRef.current || !container) return;

        const { innerWidth, innerHeight } = window;
        const xPos = (e.clientX / innerWidth - 0.5) * 2;
        const yPos = (e.clientY / innerHeight - 0.5) * 2;

        // Subtle Tilt: Max 3 degrees (very slight)
        tiltRef.current.x(xPos * 3);
        tiltRef.current.y(yPos * -3);
      };

      const handleMouseLeave = () => {
        if (tiltRef.current) {
          tiltRef.current.x(0);
          tiltRef.current.y(0);
        }
      };

      if (sectionRef.current) {
        sectionRef.current.addEventListener("mousemove", handleMouseMove);
        sectionRef.current.addEventListener("mouseleave", handleMouseLeave);
      }

      return () => {
        if (sectionRef.current) {
          sectionRef.current.removeEventListener("mousemove", handleMouseMove);
          sectionRef.current.removeEventListener(
            "mouseleave",
            handleMouseLeave,
          );
        }
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const baseClass =
    "intro-room relative rounded-xl border border-white/10 cursor-default bg-clip-padding transition-all duration-300 group backface-hidden";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 bg-white perspective-[2000px]"
    >
      <div
        ref={containerRef}
        className="w-[95%] min-h-[600px] md:w-[70vw] md:h-[70vh] grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-4 relative z-10 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- ROOM 1: Label --- */}
        <div
          className={`${baseClass} col-span-1 md:col-span-4 md:row-span-2 bg-avocado-900 p-8 flex items-start justify-start hover:-translate-y-2 hover:border-avocado-400/50 hover:shadow-2xl`}
        >
          <div
            className="font-space-mono text-xl items-end uppercase tracking-[0.25em] text-seashell-100 transition-transform duration-300 group-hover:translate-x-2"
            style={{ transform: "translateZ(150px)" }}
          >
            <AnimatedText text={t("home.aboutIntro.label")}>
              {t("home.aboutIntro.label")}
            </AnimatedText>
          </div>
        </div>

        {/* --- ROOM 2: Light Animation --- */}
        <div
          className={`${baseClass} hidden md:flex col-span-2 row-span-2 bg-neutral-800 items-center justify-center overflow-hidden hover:scale-105`}
        >
          <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(transparent,rgba(255,255,255,0.1),transparent_30%)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 w-3 h-3 bg-seashell-100 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] group-hover:scale-125 transition-transform"></div>
          <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        {/* --- ROOM 3: Heading --- */}
        <div
          className={`${baseClass} col-span-1 md:col-span-6 md:row-span-4 bg-emerald-800 p-8 md:p-12 flex items-center justify-center hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:rotate-1`}
        >
          <h2
            className="font-urbanist text-4xl md:text-5xl lowercase text-seashell-100 text-center leading-tight transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            style={{ transform: "translateZ(40px)" }}
          >
            <AnimatedText text={t("home.aboutIntro.heading")}>
              {t("home.aboutIntro.heading")}
            </AnimatedText>
          </h2>
        </div>

        {/* --- ROOM 4: Body --- */}
        <div
          className={`${baseClass} col-span-1 md:col-span-6 md:row-span-4 bg-neutral-800 p-8 md:p-10 flex flex-col justify-end hover:bg-neutral-750 hover:border-seashell-100/30`}
        >
          <div
            className="w-full h-full flex items-center"
            style={{ transform: "translateZ(20px)" }}
          >
            <p className="font-urbanist font-normal text-lg md:text-xl text-seashell-300 leading-relaxed">
              <AnimatedText text={t("home.aboutIntro.body")}>
                {(() => {
                  const body = t("home.aboutIntro.body");
                  const idx = body.lastIndexOf(" ");
                  if (idx === -1) return body;
                  return (
                    <>
                      {body.slice(0, idx + 1)}
                      <span className="font-bold text-seashell-100 group-hover:text-amber-400 transition-colors duration-300">
                        {body.slice(idx + 1)}
                      </span>
                    </>
                  );
                })()}
              </AnimatedText>
            </p>
          </div>
        </div>

        {/* --- ROOM 5: Tech Grid --- */}
        <div
          className={`${baseClass} hidden md:block col-span-4 row-span-2 bg-indigo-900 hover:skew-y-1 origin-bottom-left`}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 m-2"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          <div className="absolute top-4 right-4 flex space-x-1">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full group-hover:animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full group-hover:animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full group-hover:animate-bounce delay-150"></div>
          </div>
        </div>

        {/* --- ROOM 6: Pulse --- */}
        <div
          className={`${baseClass} hidden md:flex col-span-2 row-span-2 bg-rose-900/80 items-center justify-center hover:bg-rose-800`}
        >
          <div className="w-12 h-1 border-t border-b border-white/20 group-hover:border-white/60 transition-colors"></div>
        </div>

        {/* --- THE REFLECTION FLOOR --- 
            A separate layer pushed slightly behind/below the main grid.
            It uses backdrop-blur and gradients to simulate a glossy surface.
        */}
        <div
          className="absolute -inset-[10%] z-[-1] pointer-events-none rounded-3xl"
          style={{
            transform: "translateZ(-60px) scale(0.95)", // Pushed behind and slightly smaller
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.0) 100%)",
            backdropFilter: "blur(4px)",
            // The mask creates the "fading into infinity" edge effect
            maskImage:
              "radial-gradient(circle at center, black 40%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 40%, transparent 80%)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Reflection Simulation: Just a faint shadow copy of the main shapes logic would go here, 
                 but for performance we use a simple glow beneath the main area */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-900/10 to-transparent opacity-50 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
