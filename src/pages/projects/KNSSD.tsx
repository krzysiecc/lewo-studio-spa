/* eslint-disable @typescript-eslint/no-misused-promises */
// src/pages/projects/KNSSD.tsx

// copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import React, {
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation, Trans } from "react-i18next";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
  AnimatePresence,
} from "framer-motion";
import AnimatedText from "@/components/effects/AnimatedText";
import ImageSequence from "@/components/ImageSequence";
import LogoLoop from "@/components/LogoLoop";

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

type AnimatedPart = string | React.ReactElement<{ children?: React.ReactNode }>;

interface ScrollWordProps {
  part: AnimatedPart;
  index: number;
  total: number;
  progress: MotionValue<number>;
  wordKey: string;
}

function ScrollWord({
  part,
  index,
  total,
  progress,
  wordKey,
}: ScrollWordProps) {
  const step = total > 0 ? 1 / total : 1;
  const start = index * step;
  const end = Math.min(1, start + step);
  const opacity = useTransform(progress, [start, end], [0.3, 1]);
  const x = useTransform(progress, [start, end], [-18, 0]);
  const style = { opacity, x };

  if (typeof part === "string") {
    return (
      <motion.span
        key={wordKey}
        className="inline-block mr-2 leading-tight"
        style={style}
      >
        {part}
      </motion.span>
    );
  }

  return (
    <motion.span
      key={wordKey}
      className="inline-block mr-2 leading-tight"
      style={style}
    >
      {part}
    </motion.span>
  );
}

/**
 * AnimatedWords (top-level)
 * - Safely handles React children (elements or strings)
 * - Splits string children into words
 * - Generates deterministic keys based on content occurrence counts (avoids using array index)
 */
export function AnimatedWords({ children }: { children?: React.ReactNode }) {
  const parts: AnimatedPart[] = [];
  const containerRef = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.45"],
  });

  // eslint-disable-next-line react-x/no-children-for-each
  React.Children.forEach(children, (node) => {
    if (typeof node === "string") {
      parts.push(...node.split(" "));
      return;
    }

    if (typeof node === "number" || typeof node === "bigint") {
      parts.push(String(node));
      return;
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      parts.push(node);
    }
  });

  const counts = new Map<string, number>();

  return (
    <motion.span ref={containerRef} className="inline-block">
      {parts.map((part, index) => {
        const baseKey =
          typeof part === "string"
            ? part.trim() || "empty"
            : (() => {
                const typeName =
                  typeof part.type === "string"
                    ? part.type
                    : (() => {
                        const typeRecord = part.type as unknown as Record<
                          string,
                          unknown
                        >;
                        const displayName =
                          typeof typeRecord.displayName === "string"
                            ? typeRecord.displayName
                            : undefined;
                        const name =
                          typeof typeRecord.name === "string"
                            ? typeRecord.name
                            : undefined;
                        return displayName ?? name ?? "element";
                      })();

                const childrenValue = part.props?.children;
                const childrenKey =
                  typeof childrenValue === "string" ||
                  typeof childrenValue === "number" ||
                  typeof childrenValue === "bigint"
                    ? String(childrenValue)
                    : "";

                return `${part.key ?? typeName}-${childrenKey}`;
              })();
        const occurrence = (counts.get(baseKey) ?? 0) + 1;
        counts.set(baseKey, occurrence);
        const key = `${baseKey}_${occurrence}`;

        return (
          <ScrollWord
            key={key}
            part={part}
            index={index}
            total={parts.length}
            progress={scrollYProgress}
            wordKey={key}
          />
        );
      })}
    </motion.span>
  );
}

export default function ProjectKNSSD() {
  const { t } = useTranslation("knssd");
  const [, setHoveredHex] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  function hexToRgb(hex: string | null) {
    if (!hex) return "";
    const clean = hex.replace(/^#/, "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `RGB ${r}, ${g}, ${b}`;
  }

  function hexToCmyk(hex: string | null) {
    if (!hex) return "";
    let c = 0;
    let m = 0;
    let y = 0;
    let k = 0;

    const clean = hex.replace(/^#/, "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    // BLACK
    if (r === 0 && g === 0 && b === 0) {
      k = 1;
      return `CMYK 0, 0, 0, 100`;
    }

    c = 1 - r / 255;
    m = 1 - g / 255;
    y = 1 - b / 255;

    const minCMY = Math.min(c, Math.min(m, y));

    c = (c - minCMY) / (1 - minCMY);
    m = (m - minCMY) / (1 - minCMY);
    y = (y - minCMY) / (1 - minCMY);
    k = minCMY;

    return `CMYK ${Math.round(c * 100)}, ${Math.round(m * 100)}, ${Math.round(y * 100)}, ${Math.round(k * 100)}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore failures silently
    }
  }

  // AnimatedWords (and variants) have been moved to the top-level to avoid nested component definitions.
  const containerRef = useRef<HTMLDivElement>(null);

  // --- REFS ---
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLDivElement>(null);
  const folderSectionRef = useRef<HTMLDivElement>(null); // This acts as the Trigger/Pin
  const coinSectionRef = useRef<HTMLDivElement>(null);

  // We define the cards for the LogoLoop here to preserve the background colors
  // from the previous ScrollStack implementation, ensuring visibility of white logos.
  const logoVariations = [
    {
      node: (
        <div className="flex items-center justify-center px-8">
          <img
            src="/assets/knssd/LOGO_PODSTAWOWE_MONO.png"
            alt="Logo Podstawowe Mono"
            className="h-12 w-auto object-contain brightness-0 opacity-60 transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      ),
      title: "Podstawowe Mono",
    },
    {
      node: (
        <div className="flex items-center justify-center px-8">
          <img
            src="/assets/knssd/LOGO_PODSTAWOWE_KOLOR.png"
            alt="Logo Podstawowe Kolor"
            className="h-12 w-auto object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      ),
      title: "Podstawowe Kolor",
    },
    {
      node: (
        <div className="flex items-center justify-center px-8">
          {/* Added invert to ensure visibility if the image is white-text-only */}
          <img
            src="/assets/knssd/LOGO_DODATKOWE_MONO.png"
            alt="Logo Dodatkowe Mono"
            className="h-12 w-auto object-contain brightness-0 opacity-60 transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      ),
      title: "Dodatkowe Mono",
    },
    {
      node: (
        <div className="flex items-center justify-center px-8">
          <img
            src="/assets/knssd/LOGO_DODATKOWE_KOLOR.png"
            alt="Logo Dodatkowe Kolor"
            className="h-12 w-auto object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      ),
      title: "Dodatkowe Kolor",
    },
  ];

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
        { clipPath: "inset(0% 0% 0% 50%)", ease: "power2.out", duration: 1 },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Helper for rendering the swatch content
  const renderSwatchContent = (hex: string, textColor: string) => {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center space-y-2 text-center font-space-mono text-xs md:text-sm font-bold opacity-0 transition-opacity duration-300 hover:opacity-100 ${textColor}`}
      >
        <button
          type="button"
          onClick={() => copyToClipboard(hexToCmyk(hex))}
          className="cursor-pointer hover:underline"
        >
          {hexToCmyk(hex)}
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(hexToRgb(hex))}
          className="cursor-pointer hover:underline"
        >
          {hexToRgb(hex)}
        </button>
        <button
          type="button"
          onClick={() => copyToClipboard(hex)}
          className="cursor-pointer hover:underline uppercase"
        >
          {hex}
        </button>
      </div>
    );
  };

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

      <div className="collapse md:visible md:sticky top-0 z-[60] pointer-events-none bg-[#A895FF] backdrop-blur supports-[backdrop-filter]:bg-[#A895FF]/70">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-12 py-6 md:py-12 pointer-events-none">
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
                    <AnimatedText text={item.label} el="span">
                      <span className="relative mr-1">
                        <span className="border-b border-transparent group-hover:border-black/60 transition-colors">
                          {item.label}
                        </span>
                      </span>
                      <sup className="text-[10px] md:text-[11px] leading-none text-bluepowder-900/60">
                        {(idx + 1).toString().padStart(2, "0")}
                      </sup>
                    </AnimatedText>
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
            initial={{ opacity: 10, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.0, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Use Trans with a replacement component so language changes re-render correctly */}
            <motion.h2 className="text-3xl md:text-6xl font-futura-condensed font-extrabold uppercase leading-tight">
              <AnimatedText text={t("brief.text")} el="span">
                <Trans
                  i18nKey="brief.text"
                  ns="knssd"
                  components={[<AnimatedWords key="animated-words" />]}
                />
              </AnimatedText>
            </motion.h2>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 2: VARIATIONS (Logo Loop) ================= */}
      <section
        ref={folderSectionRef}
        id="variations"
        className="w-full bg-white relative py-32"
      >
        <div className="w-[80%] mx-auto">
          <LogoLoop
            logos={logoVariations}
            speed={60} // Standard comfortable reading speed
            direction="left" // Flows right to left
            logoHeight={48} // 48px is a standard tech logo height
            gap={0} // Gap handled by padding in the node for better centering
            hoverSpeed={0} // Pauses on hover
            scaleOnHover={false} // Clean tech look usually doesn't scale
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="KNSSD Logo Variations"
          />
        </div>
      </section>

      {/* ================= SECTION: COIN ================= */}
      <section
        ref={coinSectionRef}
        id="coin"
        className="w-full h-[300vh] bg-white relative flex items-start justify-center"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center">
          {/* <AnimatedText
            text={t("titles.coin")}
            el="h3"
            className="text-4xl md:text-6xl font-black uppercase mb-8 z-10"
          >
            {t("titles.coin")}
          </AnimatedText> */}

          {/* New Component Usage */}
          <div className="relative w-[300px] h-[300px] md:w-[700px] md:h-[700px]">
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
        className="py-32 px-20 md:px-50 bg-gray-50 border-t border-black scroll-mt-32"
      >
        <h3 className="text-4xl md:text-6xl font-black uppercase mb-16">
          {t("titles.palette")}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
          {/* Card 1 */}
          <div
            className="relative bg-[#0b1221] rounded-2xl w-full h-full border border-black overflow-hidden flex items-center justify-center"
            onMouseEnter={() => setHoveredHex("#0b1221")}
            onMouseLeave={() => setHoveredHex(null)}
          >
            {renderSwatchContent("#0b1221", "text-[#4B9D69]")}
          </div>

          {/* Card 2 */}
          <div
            className="relative bg-[#9ba1ff] rounded-2xl w-full h-full border border-black overflow-hidden flex items-center justify-center"
            onMouseEnter={() => setHoveredHex("#9ba1ff")}
            onMouseLeave={() => setHoveredHex(null)}
          >
            {renderSwatchContent("#9ba1ff", "text-[#01020B]")}
          </div>

          {/* Card 3 */}
          <div
            className="relative bg-[#8cebb6] rounded-2xl w-full h-full border border-black overflow-hidden flex items-center justify-center"
            onMouseEnter={() => setHoveredHex("#8cebb6")}
            onMouseLeave={() => setHoveredHex(null)}
          >
            {renderSwatchContent("#8cebb6", "text-[#240FCA]")}
          </div>

          {/* Card 4 (Split) */}
          <div className="rounded-2xl w-full h-full border border-black overflow-hidden flex flex-col">
            <div
              className="relative h-1/2 bg-[#6b4cfa] flex items-center justify-center overflow-hidden"
              onMouseEnter={() => setHoveredHex("#6b4cfa")}
              onMouseLeave={() => setHoveredHex(null)}
            >
              {renderSwatchContent("#6b4cfa", "text-[#9ba1ff]")}
            </div>
            <div
              className="relative h-1/2 bg-[#d599ff] flex items-center justify-center overflow-hidden"
              onMouseEnter={() => setHoveredHex("#d599ff")}
              onMouseLeave={() => setHoveredHex(null)}
            >
              {renderSwatchContent("#d599ff", "text-[#240FCA]")}
            </div>
          </div>
        </div>
      </section>

      <section
        id="fonts"
        className="py-24 px-20 md:px-50 bg-white flex flex-col scroll-mt-32"
      >
        <AnimatedText
          text={t("titles.fonts")}
          el="h3"
          className="text-4xl md:text-6xl font-black uppercase mb-8 z-10"
        >
          {t("titles.fonts")}
        </AnimatedText>
        <div className="max-w-5xl w-full flex-1/2 mx-auto">
          <img
            src="/assets/knssd/fonts.png"
            alt="Typography Showcase"
            className="w-full h-auto object-contain"
          />
        </div>
      </section>
      {/* <section
        id="mockups"
        className="py-32 px-20 md:px-50 bg-[#e5e5e5] scroll-mt-32"
      >
        <AnimatedText
          text={t("titles.mockups")}
          el="h3"
          className="text-4xl md:text-6xl font-black uppercase mb-8 z-10"
        >
          {t("titles.mockups")}
        </AnimatedText>
        <div className="w-full min-h-[600px] border-2 border-dashed border-gray-400 flex items-center justify-center">
          <p className="text-gray-600 font-space-mono text-xl">
            [ React Bits Component: Photo Gallery ]
          </p>
        </div>
      </section> */}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-[#bcbcbc] text-black px-4 py-2 rounded-sm text-sm font-space-mono lowercase shadow-md">
              <AnimatedText text={t("utils.copied", { ns: "knssd" })} el="h3">
                {t("utils.copied", { ns: "knssd" })}
              </AnimatedText>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
