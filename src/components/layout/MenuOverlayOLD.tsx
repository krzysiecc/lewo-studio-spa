// components/MenuOverlay.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  type CSSProperties,
  type Ref,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSharedLenis } from "../../hooks/useSharedLenis";
import gsap from "gsap";
import { fxBridge } from "../../utils/fxBridge";
import { MenuBackground } from "../effects/MenuBackground";

import { Trans, useTranslation } from "react-i18next";
import AnimatedText from "../effects/AnimatedText";

import { Home, LayoutGrid, Mail } from "lucide-react";

// ============================================================================
// Configuration
// ============================================================================

export interface MenuOverlayRef {
  close: () => void;
}

// Fix: Use Generics <T> to avoid 'any' type errors
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const colorMap = {
  "text-thulian-400": "#e2608d",
  "text-avocado-400": "#a2cf64",
  "text-bluepowder-400": "#96b4d2",
  "text-seashell-500": "#eeae8d",
};

const defaultHexColor = "#ffffff";

type MenuIconType = "home" | "projects" | "contact";

interface Point {
  x: number;
  y: number;
}

const FIBER_VIEWBOX = { width: 700, height: 380 };
const FIBER_STROKE_BASE = 3;
const FIBER_STROKE_HIGHLIGHT = 7;
const ICON_SIZE = 48;
const ICON_DIM_OPACITY = 0.22;

// Per-icon endpoint offsets (to make fibers end outside center)
const ICON_ENDPOINT_OFFSETS = [
  { x: 10, y: 40 }, // home: upper-left approach
  { x: 40, y: -8 }, // projects: right approach
  { x: 10, y: -40 }, // contact: upper-left approach
];

// Stroke messiness: controls lateral deviation & reversal strength
const STROKE_MESSINESS = 0.9; // 0 = straight, 1 = very chaotic

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getLucideIcon(type: MenuIconType) {
  switch (type) {
    case "home":
      return Home;
    case "projects":
      return LayoutGrid;
    case "contact":
      return Mail;
  }
}

function catmullRomToBezier(points: Point[], tension = 1) {
  if (points.length < 2) return "";
  const t = clamp(tension, 0, 2);

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1: Point = {
      x: p1.x + ((p2.x - p0.x) * t) / 6,
      y: p1.y + ((p2.y - p0.y) * t) / 6,
    };
    const c2: Point = {
      x: p2.x - ((p3.x - p1.x) * t) / 6,
      y: p2.y - ((p3.y - p1.y) * t) / 6,
    };

    parts.push(`C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`);
  }

  return parts.join(" ");
}

function makeFiberPath(params: { index: number }) {
  const { index } = params;
  const width = FIBER_VIEWBOX.width;
  const height = FIBER_VIEWBOX.height;

  const rnd = mulberry32(20260112 + index * 7919);
  const rand = (min: number, max: number) => min + (max - min) * rnd();

  // Icons sit on the left, paths originate from the right side of the left panel.
  const iconYByIndex = [height * 0.1, height * 0.68, height * 0.42];
  const iconXByIndex = [20, 84, 180];
  const startYByIndex = [height * 0.3, height * 0.9, height * 0.5];

  const iconCenter: Point = {
    x: iconXByIndex[index] ?? 84,
    y: iconYByIndex[index] ?? height * 0.5,
  };

  // Apply per-icon endpoint offset so fiber ends outside the center
  const offset = ICON_ENDPOINT_OFFSETS[index] ?? { x: 0, y: 0 };
  const icon: Point = {
    x: iconCenter.x + offset.x,
    y: iconCenter.y + offset.y,
  };

  const start: Point = {
    x: width + 160,
    y: startYByIndex[index] ?? height * 0.5,
  };

  // Build a long, chaotic polyline (then smooth it). Allow points to overshoot
  // the viewBox so it can loop/cross.
  const pts: Point[] = [start];

  const steps = 8;
  for (let k = 1; k <= steps; k++) {
    const progress = k / (steps + 1);
    const baseX = start.x + (icon.x - start.x) * progress;

    // Scale lateral deviations by messiness parameter.
    const lateralRange = 220 * STROKE_MESSINESS;
    const reversalStrength =
      k === 3 || k === 6 ? rand(-220, 180) * STROKE_MESSINESS : 0;
    const x = baseX + rand(-lateralRange, lateralRange) + reversalStrength;

    // Push paths into each other to encourage crossings.
    const clusterY = height * (0.52 + (1 - index) * 0.08);
    const verticalRange = 320 * STROKE_MESSINESS;
    const y = clusterY + rand(-verticalRange, verticalRange);

    pts.push({ x, y });
  }

  pts.push(icon);

  // Return both icon endpoint and iconCenter for positioning
  const result = { d: catmullRomToBezier(pts, 1.15), icon, iconCenter, start };

  return result;
}

// ============================================================================
// Main Menu Overlay Component
// ============================================================================

interface MenuOverlayProps {
  onClose: () => void;
  ref?: Ref<MenuOverlayRef>;
}

const MenuOverlay = ({ onClose, ref }: MenuOverlayProps) => {
  const navigate = useNavigate();
  const lenisRef = useSharedLenis();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const highlightPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const iconWrapperRefs = useRef<(SVGGElement | null)[]>([]);

  const { t } = useTranslation();

  const menuItems = useMemo(
    () => [
      {
        i18nKey: "overlaymenu.home",
        path: "/",
        colorClass: "text-seashell-400",
        glowClass: "glow-seashell",
        icon: "home" as const,
      },
      {
        i18nKey: "overlaymenu.projects",
        path: "/projects",
        colorClass: "text-avocado-400",
        glowClass: "glow-avocado",
        icon: "projects" as const,
      },
      {
        i18nKey: "overlaymenu.contact",
        path: "/contact",
        colorClass: "text-bluepowder-300",
        glowClass: "glow-seashell",
        icon: "contact" as const,
      },
    ],
    [],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex !== null ? menuItems[activeIndex] : null;
  const activeHexColor = activeItem
    ? colorMap[activeItem.colorClass as keyof typeof colorMap]
    : defaultHexColor;

  // --- EFFECTS ---

  useEffect(() => {
    fxBridge.update(activeIndex !== null, activeHexColor);
  }, [activeIndex, activeHexColor]);

  useEffect(() => {
    const lenisInstance = lenisRef.current;
    lenisInstance?.stop();

    const ctx = gsap.context(() => {
      const navLinks = gsap.utils.toArray<HTMLElement>(".nav-link");

      const tl = gsap.timeline();

      if (mainContainerRef.current) {
        tl.to(mainContainerRef.current, {
          opacity: 1,
          duration: 1.0,
          ease: "power2.inOut",
          onStart: () => {
            fxBridge.update(false, defaultHexColor);
          },
        });
      }

      const shuffledLinks = shuffleArray(navLinks);

      shuffledLinks.forEach((link, index) => {
        const sequenceStartTime = 1.0 + index * 0.3;
        tl.fromTo(
          link,
          { opacity: 0.5, filter: "blur(8px) brightness(1.2)" },
          {
            opacity: 0.9,
            filter: "blur(1px) brightness(1.2)",
            duration: 0.08,
            ease: "steps(1)",
            repeat: 3,
            yoyo: true,
          },
          sequenceStartTime,
        );
        tl.to(
          link,
          {
            opacity: 1,
            filter: "blur(0px) brightness(1)",
            scale: 1,
            duration: 0.5,
            ease: "expo.out",
          },
          sequenceStartTime + 0.08 * 4,
        );
      });
    }, mainContainerRef);

    return () => {
      lenisInstance?.start();
      ctx.revert();
    };
  }, [lenisRef]);

  // Initialize dash lengths once (geometry is fixed in the viewBox)
  useEffect(() => {
    const paths = highlightPathRefs.current;
    const icons = iconWrapperRefs.current;

    paths.forEach((pathEl) => {
      if (!pathEl) return;
      const len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${len}`;
      pathEl.style.strokeDashoffset = `${len}`;
      gsap.set(pathEl, { opacity: 0 });
    });

    icons.forEach((iconEl) => {
      if (!iconEl) return;
      gsap.set(iconEl, { opacity: 0, scale: 0.9, transformOrigin: "1% 50%" });
    });
  }, []);

  useEffect(() => {
    const paths = highlightPathRefs.current;
    const icons = iconWrapperRefs.current;

    // Important: kill any delayed tweens so a previously-hovered icon
    // can't light up later (was causing mismatched glows).
    gsap.killTweensOf(paths.filter(Boolean));
    gsap.killTweensOf(icons.filter(Boolean));

    if (activeIndex === null) {
      paths.forEach((pathEl, index) => {
        if (!pathEl) return;
        const len = pathEl.getTotalLength();
        gsap.set(pathEl, { opacity: 0, strokeDashoffset: len });
        if (icons[index]) gsap.set(icons[index], { opacity: 0, scale: 0.9 });
      });
      return;
    }

    paths.forEach((pathEl, index) => {
      if (!pathEl) return;
      const len = pathEl.getTotalLength();

      if (index === activeIndex) {
        gsap.killTweensOf(pathEl);
        gsap.set(pathEl, { opacity: 1, strokeDashoffset: len });
        gsap.to(pathEl, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: "power2.out",
        });

        if (icons[index]) {
          gsap.killTweensOf(icons[index]);
          gsap.to(icons[index], {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: "power3.out",
            delay: 0.55,
          });
        }
      } else {
        gsap.set(pathEl, { opacity: 0, strokeDashoffset: len });
        if (icons[index]) gsap.set(icons[index], { opacity: 0, scale: 0.9 });
      }
    });
  }, [activeIndex]);

  // --- HANDLERS ---

  const handleClose = () => {
    gsap.set(".nav-link", { pointerEvents: "none" });

    const exitTimeline = gsap.timeline({ onComplete: onClose });

    fxBridge.update(false, defaultHexColor);

    exitTimeline.to(
      [".nav-link", previewContainerRef.current] as gsap.TweenTarget,
      {
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.4,
        ease: "power2.in",
      },
    );
    exitTimeline.to(
      mainContainerRef.current,
      { opacity: 0, duration: 0.8, ease: "power2.inOut" },
      "<",
    );
  };

  useImperativeHandle(ref, () => ({
    close() {
      handleClose();
    },
  }));

  const handleNavigate = (path: string) => {
    handleClose();
    setTimeout(() => {
      void navigate(path);
    }, 800);
  };

  // --- RENDER ---

  return (
    <div ref={mainContainerRef} className="fixed inset-0 z-40 opacity-0">
      {/* LAYER 1: Backdrop (click to close) */}
      <button
        type="button" // Fix: Added explicit type
        aria-label="Close menu"
        className="absolute inset-0 z-10 bg-black/99"
        onClick={handleClose}
      />

      {/* LAYER 2: Visual FX (no pointer!) */}
      <MenuBackground />

      {/* LAYER 3: Interactive content on top */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="layout-grid grid grid-cols-12 gap-4 md:gap-6 relative w-full">
          {/* LEFT: Fibers */}
          <div className="col-span-7 col-start-1 flex items-center justify-start">
            <div
              ref={previewContainerRef}
              aria-hidden="true"
              className="pointer-events-none relative h-[min(720px,80vh)] w-[700px] max-w-full"
              style={{ padding: "10px" }}
            >
              <svg
                viewBox={`0 0 ${FIBER_VIEWBOX.width} ${FIBER_VIEWBOX.height}`}
                preserveAspectRatio="xMinYMid meet"
                className="h-full w-full"
              >
                {menuItems.map((item, index) => {
                  const colorHex =
                    colorMap[item.colorClass as keyof typeof colorMap] ??
                    defaultHexColor;

                  const { d, iconCenter } = makeFiberPath({ index });
                  const Icon = getLucideIcon(item.icon);

                  return (
                    <g key={item.path}>
                      {/* Base (dim) fiber */}
                      <path
                        d={d}
                        stroke={colorHex}
                        strokeWidth={FIBER_STROKE_BASE}
                        strokeLinecap="round"
                        fill="none"
                        opacity={0.16}
                        vectorEffect="non-scaling-stroke"
                      />

                      {/* Highlight (drawn in sequence, right->left) */}
                      <path
                        ref={(el) => {
                          highlightPathRefs.current[index] = el;
                        }}
                        d={d}
                        stroke={colorHex}
                        strokeWidth={FIBER_STROKE_HIGHLIGHT}
                        strokeLinecap="round"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        style={{
                          filter: `drop-shadow(0 0 18px ${colorHex}) drop-shadow(0 0 42px ${colorHex})`,
                        }}
                      />

                      {/* Endpoint icon (always visible, dim) - centered on iconCenter */}
                      <g
                        transform={`translate(${iconCenter.x - ICON_SIZE / 2}, ${
                          iconCenter.y - ICON_SIZE / 2
                        })`}
                        opacity={ICON_DIM_OPACITY}
                      >
                        <Icon
                          size={ICON_SIZE}
                          color={colorHex}
                          strokeWidth={2}
                        />
                      </g>

                      {/* Endpoint icon (glow layer, animated) - centered on iconCenter */}
                      <g
                        ref={(el) => {
                          iconWrapperRefs.current[index] = el;
                        }}
                        style={{
                          filter: `drop-shadow(0 0 18px ${colorHex}) drop-shadow(0 0 42px ${colorHex})`,
                        }}
                        transform={`translate(${iconCenter.x - ICON_SIZE / 2}, ${
                          iconCenter.y - ICON_SIZE / 2
                        })`}
                      >
                        <Icon
                          size={ICON_SIZE}
                          color={colorHex}
                          strokeWidth={2}
                        />
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* RIGHT: Nav */}
          <div className="col-span-5 col-start-8 flex items-center justify-start">
            <nav
              aria-label="Main"
              className="relative w-full max-w-[280px] md:max-w-[540px]"
            >
              <ul className="flex flex-col items-stretch gap-6">
                {menuItems.map((item, index) => (
                  <li key={item.path} className="w-full">
                    <button
                      type="button"
                      style={
                        {
                          "--menu-glow":
                            colorMap[
                              item.colorClass as keyof typeof colorMap
                            ] ?? defaultHexColor,
                        } as CSSProperties
                      }
                      className={`nav-link group relative flex w-full items-center justify-start bg-transparent border-0 px-2 py-3 text-left ${item.colorClass}`}
                      onPointerEnter={() => setActiveIndex(index)}
                      onPointerLeave={() => setActiveIndex(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item.path);
                      }}
                    >
                      {/* label */}
                      <AnimatedText
                        el="span"
                        className="relative font-antonio font-bold lowercase tracking-widest text-5xl leading-none md:text-7xl"
                        text={t(item.i18nKey)}
                        padForGlow={false}
                      >
                        <Trans i18nKey={item.i18nKey} />
                      </AnimatedText>

                      {/* underline (use current text color) */}
                      <span
                        className="pointer-events-none absolute -bottom-[1vw] left-[-8vw] right-[16vw] h-[4px] origin-right scale-x-0 transition-transform duration-600 group-hover:scale-x-100 group-hover:origin-right group-focus-visible:scale-x-100 group-focus-visible:origin-right"
                        style={{ backgroundColor: "currentColor" }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
