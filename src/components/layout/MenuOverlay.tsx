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
  type RefObject,
  useLayoutEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSharedLenis } from "../../hooks/useSharedLenis";
import gsap from "gsap";
import { fxBridge } from "../../utils/fxBridge";
import { MenuBackground } from "../effects/MenuBackground";
import FibersCanvas from "../effects/FibersCanvas";
import { createFiber } from "../effects/FiberHelpers";

import { useTranslation } from "react-i18next";
import AnimatedText from "../effects/AnimatedText";

import { Home, LayoutGrid, Mail } from "lucide-react";

// ============================================================================
// Configuration
// ============================================================================

export interface MenuOverlayRef {
  close: () => void;
}

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
  "text-bluepowder-300": "#adcade",
  "text-bluepowder-400": "#96b4d2",
  "text-seashell-500": "#eeae8d",
};

const defaultHexColor = "#ffffff";
const ICON_SIZE = 70;

// ============================================================================
// Main Menu Overlay Component
// ============================================================================

interface MenuOverlayProps {
  onClose: () => void;
  ref?: Ref<MenuOverlayRef>;
  FIBER_START_OFFSET_VW?: number | number[];
}

const MenuOverlay = ({ onClose, ref }: MenuOverlayProps) => {
  const navigate = useNavigate();
  const lenisRef = useSharedLenis();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const endpointRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Previously we hid fibers on small screens; that made them appear "invisible"
  // whenever the viewport (or devtools) was narrower than the cutoff.
  // Keep the constant but default to showing fibers everywhere.
  const MOBILE_HIDE_WIDTH = 0;

  const [containerWidth, setContainerWidth] = useState(0);
  const [, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [buttonsReady, setButtonsReady] = useState(false);
  const [endpointsReady, setEndpointsReady] = useState(false);
  const [menuGlowColors, setMenuGlowColors] = useState<string[]>([]);

  const { t } = useTranslation();

  const menuItems = useMemo(
    () => [
      {
        i18nKey: "overlaymenu.home",
        path: "/",
        colorClass: "text-seashell-100",
        icon: "home" as const,
      },
      {
        i18nKey: "overlaymenu.projects",
        path: "/projects",
        colorClass: "text-seashell-100",
        icon: "projects" as const,
      },
      {
        i18nKey: "overlaymenu.contact",
        path: "/contact",
        colorClass: "text-seashell-100",
        icon: "contact" as const,
      },
    ],
    []
  );

  const leftEndpoints = useMemo(
    () => [
      { xPct: 0.33, yPct: 0.2, yOffsetPx: 0 },
      { xPct: 0.33, yPct: 0.33, yOffsetPx: 0 },
      { xPct: 0.33, yPct: 0.47, yOffsetPx: 0 },
    ],
    []
  );

  const leftIcons = useMemo(
    () => [
      { xPct: 0.25, yPct: 0.83, yOffsetPx: 0, Icon: Home },
      { xPct: 0.32, yPct: 0.83, yOffsetPx: 0, Icon: LayoutGrid },
      { xPct: 0.39, yPct: 0.83, yOffsetPx: 0, Icon: Mail },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex !== null ? menuItems[activeIndex] : null;
  const activeHexColor = activeItem
    ? colorMap[activeItem.colorClass as keyof typeof colorMap]
    : defaultHexColor;

  // ==========================================================================
  // INDIVIDUAL FIBER CREATION
  // ==========================================================================
  const fibers = useMemo(() => {
    // Only generate fibers if buttons are mounted
    if (!buttonsReady || !endpointsReady) return [];
    if (menuGlowColors.length !== menuItems.length) return [];

    // --- HOME FIBER ---
    const homeFiber = createFiber({
      id: "/",
      from: {
        type: "element",
        element: buttonRefs.current[0],
        attach: "left",
      },
      to: {
        type: "element",
        element: endpointRefs.current[0],
        attach: "center",
      },
      fromOffset: { x: -80, y: 30 },
      toOffset: { x: 20, y: 0 },
      color: menuGlowColors[0] ?? defaultHexColor,

      curve: "wave",
      direction: "rightToLeft",
      smoothness: 0.1,
      segments: 100,
      leadInPx: 5,
      radiusPx: 1,
      curlAspect: 0.1,
      curlReverse: false,
      seed: 420 * 2137,

      isActive: activeIndex === 0,
    });

    // --- 2. PROJECTS FIBER ---
    const projectsFiber = createFiber({
      id: "/projects",
      from: {
        type: "element",
        element: buttonRefs.current[1],
        attach: "left",
      },
      to: {
        type: "element",
        element: endpointRefs.current[1],
        attach: "center",
      },
      fromOffset: { x: -80, y: 10 },
      toOffset: { x: 20, y: 0 },
      color: menuGlowColors[1] ?? defaultHexColor,

      // Projects Physics
      curve: "wave",
      direction: "rightToLeft",
      smoothness: 0.2,
      segments: 100,
      leadInPx: 5,
      radiusPx: 10,
      curlAspect: 0.1,
      curlReverse: true,
      seed: 1200, // Specific seed for Projects

      isActive: activeIndex === 1,
    });

    // --- 3. CONTACT FIBER ---
    const contactFiber = createFiber({
      id: "/contact",
      from: {
        type: "element",
        element: buttonRefs.current[2],
        attach: "left",
      },
      to: {
        type: "element",
        element: endpointRefs.current[2],
        attach: "center",
      },
      fromOffset: { x: -80, y: 10 },
      toOffset: { x: 20, y: 0 },
      color: menuGlowColors[2] ?? defaultHexColor,

      // Contact Physics
      curve: "wave",
      direction: "rightToLeft",
      smoothness: 0.6,
      segments: 100,
      leadInPx: 5,
      radiusPx: 80,
      curlAspect: 0.4,
      curlReverse: false,
      seed: 9001 * 765, // Specific seed for Contact

      isActive: activeIndex === 2,
    });

    return [homeFiber, projectsFiber, contactFiber];
  }, [
    buttonsReady,
    endpointsReady,
    menuGlowColors,
    menuItems.length,
    activeIndex,
  ]);

  useLayoutEffect(() => {
    const root = mainContainerRef.current;
    if (!root) return;

    const update = () => {
      const rect = root.getBoundingClientRect();
      setContainerWidth(rect.width);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(root);

    const onResize = () => {
      setWindowWidth(window.innerWidth);
      update();
    };
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    // Mark buttons as ready after they're mounted
    const allButtonsMounted = buttonRefs.current.every((btn) => btn !== null);
    if (allButtonsMounted && buttonRefs.current.length === menuItems.length) {
      setButtonsReady(true);
    }
  }, [menuItems.length]);

  useLayoutEffect(() => {
    const allEndpointsMounted = endpointRefs.current.every((el) => el !== null);
    if (
      allEndpointsMounted &&
      endpointRefs.current.length === menuItems.length &&
      !endpointsReady
    ) {
      setEndpointsReady(true);
    }
  }, [menuItems.length, endpointsReady]);

  useLayoutEffect(() => {
    if (!buttonsReady) return;
    if (typeof window === "undefined") return;

    const colors = menuItems.map((_, index) => {
      const el = buttonRefs.current[index];
      if (!el) return defaultHexColor;
      const style = window.getComputedStyle(el);
      const glow = style.getPropertyValue("--menu-glow") ?? "";
      const resolved = glow.trim().length > 0 ? glow : (style.color ?? "");
      return resolved.trim().length > 0 ? resolved : defaultHexColor;
    });

    setMenuGlowColors(colors);
  }, [buttonsReady, menuItems]);

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
          sequenceStartTime
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
          sequenceStartTime + 0.08 * 4
        );
      });
    }, mainContainerRef);

    return () => {
      lenisInstance?.start();
      ctx.revert();
    };
  }, [lenisRef]);

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
      }
    );
    exitTimeline.to(
      mainContainerRef.current,
      { opacity: 0, duration: 0.8, ease: "power2.inOut" },
      "<"
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
      {/* =========================================
          LAYER 0: BACKGROUND
      ========================================= */}
      <div className="absolute inset-0 z-0">
        <MenuBackground />
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 h-full w-full bg-black/99 cursor-default"
          onClick={handleClose}
        />
      </div>

      {/* =========================================
          LAYER 1: FIBERS (single full-screen SVG, no seam)
      ========================================= */}
      <div
        ref={previewContainerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
      >
        {containerWidth >= MOBILE_HIDE_WIDTH && (
          <FibersCanvas
            containerRef={mainContainerRef as unknown as RefObject<HTMLElement>}
            fibers={fibers}
          />
        )}
      </div>

      {/* =========================================
          LAYER 1.5: LEFT ENDPOINTS + LEFT ICONS
      ========================================= */}
      {containerWidth >= MOBILE_HIDE_WIDTH && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[15]"
        >
          {/* Fiber end markers (these are the actual fiber endpoints) */}
          {menuItems.map((item, index) => {
            const c = menuGlowColors[index] ?? defaultHexColor;
            const isActive = activeIndex === index;
            const p = leftEndpoints[index];

            return (
              <span
                key={`fiber-end-${item.path}`}
                ref={(el) => {
                  endpointRefs.current[index] = el;
                }}
                style={{
                  position: "absolute",
                  left: `${p.xPct * 100}%`,
                  top: `calc(${p.yPct * 100}% + ${p.yOffsetPx}px)`,
                  transform: "translate(-50%, -50%)",
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  backgroundColor: c,
                  opacity: isActive ? 1 : 0.7,
                  boxShadow: isActive
                    ? `0 0 12px ${c}, 0 0 30px ${c}, 0 0 70px ${c}`
                    : `0 0 10px ${c}`,
                  transition:
                    "opacity 220ms ease, box-shadow 220ms ease, transform 220ms ease",
                }}
              />
            );
          })}

          {/* Separate left-side icons (diagonal, matching vertical gaps) */}
          {leftIcons.map(({ xPct, yPct, yOffsetPx, Icon }, index) => {
            const c = menuGlowColors[index] ?? defaultHexColor;
            const isActive = activeIndex === index;
            return (
              <div
                key={`left-icon-${index}`}
                style={{
                  position: "absolute",
                  left: `${xPct * 100}%`,
                  top: `calc(${yPct * 100}% + ${yOffsetPx}px)`,
                  transform: "translate(-50%, -50%)",
                  opacity: isActive ? 1 : 0.45,
                  filter: isActive
                    ? `drop-shadow(0 0 12px ${c}) drop-shadow(0 0 26px ${c})`
                    : `drop-shadow(0 0 8px ${c})`,
                  transition: "opacity 220ms ease, filter 220ms ease",
                }}
              >
                <Icon size={ICON_SIZE} color={c} strokeWidth={1.5} />
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================
          LAYER 2: NAVIGATION
          Desktop: Pushed Right (md:justify-end, md:pr-24)
      ========================================= */}
      <div className="absolute right-0 top-[-30vh] bottom-0 z-20 flex items-center justify-center md:justify-right w-full md:w-[35vw]">
        <div className="w-full max-w-[740px] pl-4 md:pl-0 md:pr-30">
          <nav aria-label="Main" className="relative w-full">
            <ul className="flex flex-col items-stretch gap-10">
              {menuItems.map((item, index) => {
                const label = t(item.i18nKey).trim();
                const words = label.length ? label.split(/\s+/) : [];
                return (
                  <li key={item.path} className="w-full">
                    <button
                      ref={(el) => {
                        buttonRefs.current[index] = el;
                        if (el && !buttonsReady) {
                          const allReady = buttonRefs.current.every(
                            (btn, i) => i > index || btn !== null
                          );
                          if (
                            allReady &&
                            buttonRefs.current.length === menuItems.length
                          ) {
                            setButtonsReady(true);
                          }
                        }
                      }}
                      type="button"
                      style={
                        {
                          "--menu-glow":
                            colorMap[
                              item.colorClass as keyof typeof colorMap
                            ] ?? defaultHexColor,
                        } as CSSProperties
                      }
                      className={`nav-link group relative flex w-full items-center justify-start md:justify-start bg-transparent border-0 px-2 py-3 text-center md:text-left ${item.colorClass}`}
                      onPointerEnter={() => setActiveIndex(index)}
                      onPointerLeave={() => setActiveIndex(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item.path);
                      }}
                    >
                      <AnimatedText
                        el="span"
                        className="relative font-urbanist font-normal lowercase tracking-widest text-4xl leading-none md:text-7xl"
                        text={label}
                        padForGlow={false}
                      >
                        {words.map((w) => (
                          <span key={w} className="block">
                            {w}
                          </span>
                        ))}
                      </AnimatedText>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
