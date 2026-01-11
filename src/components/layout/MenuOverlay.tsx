// components/MenuOverlay.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.

import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  type Ref,
} from "react";
import { useNavigate } from "react-router-dom";
// Use the new hook file path
import { useSharedLenis } from "../../hooks/useSharedLenis";
import gsap from "gsap";
// Use the new bridge file path
import { fxBridge } from "../../utils/fxBridge";
import { MenuBackground } from "../effects/MenuBackground";

import { Trans, useTranslation } from "react-i18next";
import AnimatedText from "../effects/AnimatedText";

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

const GOOGLE_MAPS_EMBED_URL =
  "https://maps.google.com/maps?width=720&height=720&hl=en&q=Horbaczewskiego%2045,%20Wroc%C5%82aw+(Lena%20Wojew%C3%B3dzka%20Design%20Studio)&t=h&z=12&ie=UTF8&iwloc=B&output=embed";

const colorMap = {
  "text-thulian-400": "#e2608d",
  "text-avocado-400": "#a2cf64",
  "text-bluepowder-400": "#96b4d2",
  "text-seashell-500": "#eeae8d",
};

const defaultHexColor = "#ffffff";

// ============================================================================
// Main Menu Overlay Component
// ============================================================================

// Fix: Refactored for React 19 style (ref in props) and TypeScript strictness
interface MenuOverlayProps {
  onClose: () => void;
  ref?: Ref<MenuOverlayRef>; // React 19 allows ref in props
}

const MenuOverlay = ({ onClose, ref }: MenuOverlayProps) => {
  const navigate = useNavigate();
  const lenisRef = useSharedLenis();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const menuItems = useMemo(
    () => [
      {
        label: t("overlaymenu.home"),
        path: "/",
        colorClass: "text-seashell-400",
        glowClass: "glow-seashell",
        image: "/unsplash2.jpg",
        description:
          "a curated collection of elegant, functional living spaces",
      },
      {
        label: t("overlaymenu.projects"),
        path: "/projects",
        colorClass: "text-avocado-400",
        glowClass: "glow-avocado",
        image: "/unsplash3.jpg",
        description: "a dedicated space for motion, light and detail",
      },
      {
        label: t("overlaymenu.contact"),
        path: "/contact",
        colorClass: "text-seashell-400",
        glowClass: "glow-seashell",
        isMap: true,
        description: "located in the heart of the creative district",
      },
    ],
    [t],
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

  // Entry and Interactivity Lock Effect
  useEffect(() => {
    const lenisInstance = lenisRef.current;
    lenisInstance?.stop();

    const ctx = gsap.context(() => {
      // Fix: Cast to HTMLElement[] to avoid unsafe arguments in shuffleArray downstream
      const navLinks = gsap.utils.toArray<HTMLElement>(".nav-link");

      gsap.set(navLinks, { pointerEvents: "none" });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(navLinks, { pointerEvents: "auto" });
        },
      });

      // Fix: mainContainerRef.current is strictly typed, so this is fine
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

      // Fix: navLinks is now properly typed, shuffleArray uses Generics
      const shuffledLinks = shuffleArray(navLinks);

      shuffledLinks.forEach((link, index) => {
        const sequenceStartTime = 1.0 + index * 0.2;
        tl.fromTo(
          link,
          { opacity: 0.5, filter: "blur(8px) brightness(1.2)" },
          {
            opacity: 0.9,
            filter: "blur(2px) brightness(1.8)",
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

  // Preview Pane Animation Effect
  useEffect(() => {
    if (activeItem) {
      gsap.fromTo(
        previewContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    } else {
      gsap.to(previewContainerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [activeItem]);

  // --- HANDLERS ---

  const handleClose = () => {
    gsap.set(".nav-link", { pointerEvents: "none" });

    const exitTimeline = gsap.timeline({ onComplete: onClose });

    fxBridge.update(false, defaultHexColor);

    // Fix: Cast array to TweenTarget
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
    setTimeout(() => navigate(path), 800);
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
      <MenuBackground
        defaultCloudColor={defaultHexColor}
        cloudScale={2.0}
        cloudSpeed={0.03}
        cloudContrast={2.5}
      />

      {/* LAYER 3: Interactive content on top */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="layout-grid w-full">
          {/* LEFT: Preview */}
          <div
            ref={previewContainerRef}
            className="col-span-6 col-start-1 opacity-0"
          >
            {activeItem && (
              <div key={activeItem.label} className="text-seashell-100">
                {activeItem.isMap ? (
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-white/80">
                    <iframe
                      src={GOOGLE_MAPS_EMBED_URL}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Studio location"
                      // Google Maps requires both scripts and same-origin to work interactively
                      // eslint-disable-next-line react-dom/no-unsafe-iframe-sandbox
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  </div>
                ) : (
                  <img
                    src={activeItem.image}
                    alt={activeItem.label}
                    className="aspect-video w-full object-cover rounded-md bg-coffee-800"
                  />
                )}
                <p className="mt-4 font-mono text-sm leading-relaxed text-seashell-200/80">
                  {activeItem.description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Nav */}
          <div className="col-span-6 col-start-8 flex items-center justify-end">
            <nav className="relative flex flex-col items-end gap-4">
              {menuItems.map((item, index) => (
                <button
                  type="button" // Fix: Added explicit type
                  key={item.path}
                  className={`
              nav-link cursor-pointer
              font-antonio text-5xl/[1.5] md:text-7xl/[1.5] lowercase
              transition-colors duration-300 text-glow text-right
            tracking-widest
              ${item.colorClass}
            `}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item.path);
                  }}
                >
                  <AnimatedText
                    el="span"
                    className="font-bold"
                    text={item.label}
                  >
                    <Trans i18nKey={item.label} />
                  </AnimatedText>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
