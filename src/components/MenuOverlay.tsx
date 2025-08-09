// components/LayoutComponents/MenuOverlay.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ForwardRefRenderFunction,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSharedLenis } from "../context/LenisContext";
import gsap from "gsap";
import { MenuBackground, fxBridge } from "./FX/MenuBackground";

// ============================================================================
// Configuration
// ============================================================================

export type MenuOverlayRef = { close: () => void };

function shuffleArray(array: any[]) {
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

const menuItems = [
  {
    label: "Projects",
    path: "/",
    colorClass: "text-thulian-400",
    glowClass: "glow-thulian",
    image: "/unsplash2.jpg",
    description: "a curated collection of elegant, functional living spaces",
  },
  {
    label: "About",
    path: "/about",
    colorClass: "text-avocado-400",
    glowClass: "glow-avocado",
    image: "/unsplash1.jpg",
    description: "driven by a passion for form, function, and personality",
  },
  {
    label: "Studio",
    path: "/studio",
    colorClass: "text-bluepowder-400",
    glowClass: "glow-bluepowder",
    image: "/unsplash3.jpg",
    description: "where ideas take shape and visions become reality",
  },
  {
    label: "Contact",
    path: "/contact",
    colorClass: "text-seashell-500",
    glowClass: "glow-seashell",
    isMap: true,
    description: "located in the heart of the creative district",
  },
];

const GOOGLE_MAPS_EMBED_URL =
  "https://maps.google.com/maps?width=720&amp;height=720&amp;hl=en&amp;q=Horbaczewskiego%2045,%20Wroc%C5%82aw+(Lena%20Wojew%C3%B3dzka%20Design%20Studio)&amp;t=h&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed";

const colorMap = {
  "text-thulian-400": "#e2608d",
  "text-avocado-400": "#a2cf64",
  "text-bluepowder-400": "#96b4d2",
  "text-seashell-500": "#eeae8d",
};

// 👇 FIX: Use a subtly visible color for the default cloud state
const defaultHexColor = "#ffffff";

// ============================================================================
// Main Menu Overlay Component
// ============================================================================

const MenuOverlayRender: ForwardRefRenderFunction<
  MenuOverlayRef,
  { onClose: () => void }
> = ({ onClose }, ref) => {
  const navigate = useNavigate();
  const lenisRef = useSharedLenis();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex !== null ? menuItems[activeIndex] : null;
  const activeHexColor = activeItem
    ? colorMap[activeItem.colorClass as keyof typeof colorMap]
    : defaultHexColor;

  // --- EFFECTS ---

  useEffect(() => {
    // When the active color changes, send the new state to the bridge
    fxBridge.update(activeIndex !== null, activeHexColor);
  }, [activeIndex, activeHexColor]);

  // Entry and Interactivity Lock Effect
  useEffect(() => {
    const lenisInstance = lenisRef.current;
    lenisInstance?.stop();

    const ctx = gsap.context(() => {
      const navLinks = gsap.utils.toArray(".nav-link");

      // 👇 FIX: Disable pointer events at the start of the animation
      gsap.set(navLinks, { pointerEvents: "none" });

      const tl = gsap.timeline({
        // 👇 FIX: Re-enable pointer events only when the animation is complete
        onComplete: () => {
          gsap.set(navLinks, { pointerEvents: "auto" });
        },
      });

      tl.to(mainContainerRef.current, {
        opacity: 1,
        duration: 1.0,
        ease: "power2.inOut",
        onStart: () => {
          // Tell the background to animate to its default, visible state.
          fxBridge.update(false, defaultHexColor);
        },
      });

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

  // Preview Pane Animation Effect
  useEffect(() => {
    if (activeItem) {
      gsap.fromTo(
        previewContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
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

    exitTimeline.to([".nav-link", previewContainerRef.current], {
      opacity: 0,
      filter: "blur(10px)",
      duration: 0.4,
      ease: "power2.in",
    });
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
    setTimeout(() => navigate(path), 800);
  };

  // --- RENDER ---

  return (
    <div ref={mainContainerRef} className="fixed inset-0 z-40 opacity-0">
      {/* LAYER 1: Backdrop (click to close) */}
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 z-10 bg-black/97"
        onClick={handleClose}
      />

      {/* LAYER 2: Visual FX (no pointer!) */}
      <MenuBackground
        defaultCloudColor={defaultHexColor}
        cloudScale={0.5}
        cloudSpeed={0.05}
        cloudContrast={2.5}
      />

      {/* LAYER 3: Interactive content on top */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="layout-grid w-full">
          {/* LEFT: Preview */}
          <div ref={previewContainerRef} className="col-span-6 opacity-0">
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
          <div className="col-start-8 col-span-5 flex items-center justify-start">
            <nav className="relative flex flex-col items-start gap-4">
              {menuItems.map((item, index) => (
                <button
                  key={item.path}
                  className={`
              nav-link cursor-pointer
              font-antonio text-5xl md:text-7xl lowercase
              transition-colors duration-300 text-glow text-left
              ${item.colorClass}
            `}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item.path);
                  }}
                >
                  <span className="font-bold">{item.label.charAt(0)}</span>
                  <span className="font-extralight">{item.label.slice(1)}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuOverlay = forwardRef(MenuOverlayRender);
export default MenuOverlay;
