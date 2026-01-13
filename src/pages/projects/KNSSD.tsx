// src/pages/projects/KNSSD.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import type { RefObject } from "react";
import { useLayoutEffect, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import AnimatedText from "@/components/effects/AnimatedText";
import ImageSequence from "@/components/ImageSequence";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";

gsap.registerPlugin(ScrollTrigger);

//
// This helps visualize how we are "cropping" the full screen to look like a small box initially.

const PatternSVG = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 800 800"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMaxYMid slice"
  >
    <defs>
      <symbol id="EyeSymbol" overflow="visible">
        <g transform="translate(-165.6, -272)">
          <ellipse
            cx="165.6"
            cy="272"
            rx="232.9"
            ry="230"
            fill="#a895ff"
            stroke="#09173e"
            strokeWidth={20.3}
          />
          <path
            d="M215.8,357c-31.5,-15.9 -70,-3.7 -86.6,27.5c-0,0 -0,0 -0,0c-17.8,34.6 -59.3,47 -92.7,27.7c-33.4,-19.3 -46.1,-63 -28.3,-97.6l67.7,-129.8c0.6,-1.2 14.8,-29.1 29,-57.2c17.1,-33.6 55.7,-50.2 91.8,-39.5c0,0 0,0 0,0c0,0 19.2,6.3 32.5,12c28.1,12 16.1,44.2 16.1,44.2l77,36.4l-82.3,188.5c-0,0 -10.6,-5.4 -24.1,-12.2Z"
            fill="#fff"
            stroke="#09173e"
            strokeWidth={22.5}
          />
          <path
            d="M187,233c21.3,3.3 36.3,23.3 33.6,44.8c-2.7,21.5 -22.2,36.3 -43.4,33c-21.3,-3.3 -36.3,-23.3 -33.6,-44.8c2.7,-21.5 22.2,-36.3 43.4,-33Z"
            fill="#fff"
            stroke="#09173e"
            strokeWidth={22.2}
            strokeLinecap="butt"
          />
          <path
            d="M175.8,259.8c6.7,-3.5 15,-0.8 18.5,5.9c3.5,6.7 0.9,15 -5.8,18.5c-6.7,3.5 -15,0.8 -18.5,-5.9c-3.5,-6.7 -0.9,-15 5.8,-18.5Z"
            fill="#09173e"
            stroke="#09173e"
            strokeWidth={15}
            strokeLinecap="butt"
          />
        </g>
      </symbol>

      <pattern
        id="SeamlessDiceLayout"
        x="0"
        y="0"
        width="800"
        height="800"
        patternUnits="userSpaceOnUse"
        patternTransform="scale(0.25)"
      >
        <use href="#EyeSymbol" x="400" y="400" />

        <use href="#EyeSymbol" x="0" y="0" />
        <use href="#EyeSymbol" x="800" y="0" />
        <use href="#EyeSymbol" x="0" y="800" />
        <use href="#EyeSymbol" x="800" y="800" />
      </pattern>
    </defs>

    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="url(#SeamlessDiceLayout)"
    />
  </svg>
);

export default function ProjectKNSSD() {
  const { t } = useTranslation("knssd");
  const containerRef = useRef<HTMLDivElement>(null);

  // --- REFS ---
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);
  const folderSectionRef = useRef<HTMLDivElement>(null); // This acts as the Trigger/Pin
  const coinSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. HEADER PATTERN EXPANSION (Existing logic)
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerSectionRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      headerTl.fromTo(
        patternRef.current,
        { clipPath: "inset(45% 10% 45% 85%)", opacity: 1 },
        { clipPath: "inset(0% 0% 0% 50%)", ease: "power2.out", duration: 1 }
      );

      // 2. FOLDERS / VARIATIONS (The Scroll Stack)
      // Get all cards within the container context
      const cards = gsap.utils.toArray<HTMLElement>(".scroll-stack-card");
      const spacer = 40; // Pixel gap between stacked cards at the top

      // A. Initial Setup: Position cards off-screen/down
      // We space them out vertically to simulate a long list
      gsap.set(cards, {
        y: (i) => i * 350 + 100, // Distance between cards before they stack
        scale: 1,
        zIndex: (i) => cards.length - i, // Reverse z-index so first is on top
        filter: "blur(0px)",
      });

      // B. The Master Timeline
      const stackTl = gsap.timeline({
        scrollTrigger: {
          trigger: folderSectionRef.current,
          start: "top top", // Pin immediately
          end: `+=${cards.length * 100}%`, // Scroll distance based on card count
          scrub: 1,
          pin: true,
          // markers: true, // debug if needed
        },
      });

      // C. The Animation Loop
      cards.forEach((card, i) => {
        // 1. Animate the current card moving UP to the stack position
        stackTl.to(card, {
          y: i * spacer, // Final stacked position (staggered slightly)
          ease: "none",
          duration: 1,
        });

        // 2. If there is a previous card, shrink/blur it as this one arrives
        if (i > 0) {
          const prevCard = cards[i - 1];
          // We insert this animation slightly before the current card finishes arriving
          stackTl.to(
            prevCard,
            {
              scale: 0.9, // Scale down the card underneath
              filter: "blur(4px)", // Blur the card underneath
              duration: 1,
              ease: "none",
            },
            "<" // Run at start of previous tween
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-white text-black selection:bg-purple-300"
    >
      {/* ================= SECTION 1: HEADER ================= */}
      <section
        ref={headerSectionRef}
        className="relative w-full h-screen overflow-hidden bg-white flex items-center justify-center"
      >
        <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20 pointer-events-none">
          {/* Left: Text - Added z-index so it sits ABOVE the pattern when expanded */}
          <div className="flex flex-col justify-center">
            <AnimatedText
              text={t("header.title")}
              el="h1"
              className="text-4xl md:text-7xl font-futura-condensed font-bold tracking-tighter uppercase leading-[0.85] mix-blend-multiply"
            >
              {t("header.title")}
            </AnimatedText>
            {/* mix-blend-multiply makes the text look cool when the pattern goes under it */}

            <AnimatedText
              text={t("header.date")}
              el="span"
              className="font-space-mono text-sm border border-black px-2 py-1 w-fit mt-6 bg-white"
            >
              {t("header.date")}
            </AnimatedText>
          </div>
        </div>

        {/* PATTERN CONTAINER 
           1. We make it FULL SCREEN (absolute inset-0).
           2. z-index: 10 ensures it covers the white bg but stays under text if you want, 
              or z-index: 30 if you want it to cover the text too.
           3. We rely on GSAP clip-path to hide/show it.
        */}

        <div
          ref={patternRef}
          className="absolute inset-0 z-10 top-0 w-full h-full pointer-events-none"
          style={{ willChange: "clip-path" }} // Performance hint
        >
          {/* This SVG will stay static, we just reveal more of it */}
          <PatternSVG />
        </div>
      </section>

      <div className="collapse md:visible md:sticky top-0 z-[60] pointer-events-none bg-bluepowder-100 backdrop-blur supports-[backdrop-filter]:bg-bluepowder-100/70">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-12 py-6 md:py-11 pointer-events-none">
          <nav aria-label="KNSSD sections">
            <ul className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-urbanist font-bold uppercase tracking-[0.2em] text-[0.5vw] md:text-[1.2vw]">
              {(
                [
                  { id: "brief", label: t("header.nav.brief") },
                  { id: "variations", label: t("header.nav.variations") },
                  { id: "palette", label: t("header.nav.palette") },
                  { id: "fonts", label: t("header.nav.fonts") },
                  { id: "mockups", label: t("header.nav.mockups") },
                ] as const
              ).map((item, idx) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group inline-flex items-baseline gap-2 text-black/70 hover:text-black"
                  >
                    <span className="relative">
                      <span className="border-b border-transparent group-hover:border-black/60 transition-colors">
                        {item.label}
                      </span>
                    </span>
                    <sup className="text-[10px] md:text-[11px] leading-none text-bluepowder-900/60">
                      {(idx + 1).toString().padStart(2, "0")}
                    </sup>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <section
        id="brief"
        className="w-full min-h-[80vh] flex flex-col justify-center py-24 px-4 md:px-12 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a] to-white text-white scroll-mt-32"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-6xl font-futura-condensed font-extrabold uppercase leading-tight">
              <Trans
                i18nKey="brief.text"
                ns="knssd"
                components={{ highlight: <span className="text-purple-400" /> }}
              />
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 2: VARIATIONS (Scroll Stack) ================= */}
      <section
        ref={folderSectionRef}
        id="variations"
        className="w-full h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-12 left-12 z-10">
          <h3 className="text-4xl font-bold uppercase">
            {t("titles.variations")}
          </h3>
        </div>

        {/* The Component is now just a container, controlled by the GSAP timeline above */}
        <ScrollStack>
          <ScrollStackItem>
            <div className="flex flex-col h-full justify-between">
              <h2 className="text-4xl font-bold text-bluepowder-200">01</h2>
              <img
                src="/assets/knssd/LOGO_PODSTAWOWE_MONO.png"
                alt="Logo Variation 1"
                className="w-256 h-auto mt-1"
              />
            </div>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-bluepowder-100">
            <div className="flex flex-col h-full justify-between">
              <h2 className="text-4xl font-bold text-bluepowder-500">02</h2>
              <img
                src="/assets/knssd/LOGO_PODSTAWOWE_KOLOR.png"
                alt="Logo Variation 1"
                className="w-256 h-auto mt-1"
              />
            </div>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-gray-900 text-white">
            <div className="flex flex-col h-full justify-between">
              <h2 className="text-4xl font-bold text-bluepowder-700">03</h2>
              <img
                src="/assets/knssd/LOGO_DODATKOWE_MONO.png"
                alt="Logo Variation 1"
                className="w-256 h-auto mt-1"
              />
            </div>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="bg-gray-900 text-white">
            <div className="flex flex-col h-full justify-between">
              <h2 className="text-4xl font-bold text-bluepowder-900">04</h2>
              <img
                src="/assets/knssd/LOGO_DODATKOWE_KOLOR.png"
                alt="Logo Variation 1"
                className="w-256 h-auto mt-1"
              />
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </section>

      {/* ================= SECTION: COIN ================= */}
      <section
        ref={coinSectionRef}
        id="coin"
        className="w-full h-[300vh] bg-white relative flex items-start justify-center"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center">
          <AnimatedText
            text={t("titles.coin")}
            el="h3"
            className="text-4xl md:text-6xl font-black uppercase mb-8 z-10"
          >
            {t("titles.coin")}
          </AnimatedText>

          {/* New Component Usage */}
          <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
            <ImageSequence
              triggerRef={coinSectionRef as RefObject<HTMLElement>}
              folderPath="/assets/knssd/coin"
              fileNamePrefix=""
              extension=".webp"
              frameCount={60}
              digits={4}
            />
          </div>
        </div>
      </section>

      {/* ... Palette, Fonts, Mockups ... */}
      <section
        id="palette"
        className="py-32 px-4 md:px-12 bg-gray-50 border-t border-black scroll-mt-32"
      >
        <h3 className="text-4xl md:text-6xl font-black uppercase mb-16">
          {t("titles.palette")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
          <div className="bg-[#0b1221] rounded-2xl w-full h-full border border-black"></div>
          <div className="bg-[#9ba1ff] rounded-2xl w-full h-full border border-black"></div>
          <div className="bg-[#8cebb6] rounded-2xl w-full h-full border border-black"></div>
          <div className="rounded-2xl w-full h-full border border-black overflow-hidden flex flex-col">
            <div className="h-1/2 bg-[#6b4cfa]"></div>
            <div className="h-1/2 bg-[#d599ff]"></div>
          </div>
        </div>
      </section>
      <section
        id="fonts"
        className="py-24 px-4 bg-white flex flex-col items-center scroll-mt-32"
      >
        <h3 className="text-4xl md:text-6xl font-black uppercase mb-12 self-start md:ml-12">
          {t("titles.fonts")}
        </h3>
        <div className="max-w-5xl w-full">
          <img
            src="/assets/knssd/fonts-preview.png"
            alt="Typography Showcase"
            className="w-full h-auto object-contain"
          />
        </div>
      </section>
      <section
        id="mockups"
        className="py-32 px-4 md:px-12 bg-[#e5e5e5] scroll-mt-32"
      >
        <h3 className="text-4xl md:text-6xl font-black uppercase mb-16">
          {t("titles.mockups")}
        </h3>
        <div className="w-full min-h-[600px] border-2 border-dashed border-gray-400 flex items-center justify-center">
          <p className="text-gray-600 font-space-mono text-xl">
            [ React Bits Component: Photo Gallery ]
          </p>
        </div>
      </section>
    </div>
  );
}
