// components/layout/MenuOverlay.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type Ref,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

import { useSharedLenis } from "../../hooks/useSharedLenis";
import { MenuBackground } from "../effects/MenuBackground";
import FilamentBulbs from "../effects/FilamentBulbs";
import AnimatedText from "../effects/AnimatedText";

export interface MenuOverlayRef {
  close: () => void;
}

interface MenuOverlayProps {
  onClose: () => void;
  ref?: Ref<MenuOverlayRef>;
}

const MenuOverlay = ({ onClose, ref }: MenuOverlayProps) => {
  const navigate = useNavigate();
  const lenisRef = useSharedLenis();
  const { t } = useTranslation();

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const bulbsRef = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(
    () => [
      { i18nKey: "overlaymenu.home", path: "/" },
      { i18nKey: "overlaymenu.projects", path: "/projects" },
      { i18nKey: "overlaymenu.contact", path: "/contact" },
    ],
    [],
  );

  // --- OPEN ANIMATION (clean, document-order stagger) ---
  useEffect(() => {
    const lenisInstance = lenisRef.current;
    lenisInstance?.stop();

    const ctx = gsap.context(() => {
      const navLinks = gsap.utils.toArray<HTMLElement>(".nav-link");
      const tl = gsap.timeline();

      tl.to(mainContainerRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: "power2.out",
      });

      tl.from(
        bulbsRef.current,
        { opacity: 0, duration: 0.9, ease: "power2.out" },
        0.1,
      );

      tl.from(
        navLinks,
        {
          opacity: 0,
          y: 28,
          filter: "blur(8px)",
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.12,
        },
        0.25,
      );
    }, mainContainerRef);

    return () => {
      lenisInstance?.start();
      ctx.revert();
    };
  }, [lenisRef]);

  // --- CLOSE ANIMATION ---
  const handleClose = () => {
    gsap.set(".nav-link", { pointerEvents: "none" });

    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(".nav-link", {
      opacity: 0,
      y: -22,
      filter: "blur(8px)",
      duration: 0.3,
      ease: "power2.in",
      stagger: 0.06,
    });
    tl.to(
      mainContainerRef.current,
      { opacity: 0, duration: 0.45, ease: "power2.inOut" },
      "<0.1",
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
    }, 650);
  };

  // --- RENDER ---
  return (
    <div ref={mainContainerRef} className="fixed inset-0 z-40 opacity-0">
      {/* LAYER 0: black backdrop + film grain + click-to-close */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black" />
        <MenuBackground />
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 h-full w-full cursor-default"
          onClick={handleClose}
        />
      </div>

      {/* LAYER 1: filament-bulb light field */}
      <div ref={bulbsRef} className="absolute inset-0 z-[5]">
        <FilamentBulbs count={30} minSize={4} maxSize={12} />
      </div>

      {/* LAYER 2: navigation — right column, spread over the full page height */}
      <div className="absolute inset-y-0 right-0 z-20 flex w-full justify-end md:w-[44vw]">
        <nav aria-label="Main" className="relative h-full w-full">
          <ul className="flex h-full flex-col items-end justify-between py-[15vh] pr-8 md:pr-24">
            {menuItems.map((item) => {
              const label = t(item.i18nKey).trim();
              const words = label.length ? label.split(/\s+/) : [];
              return (
                <li
                  key={item.path}
                  className="group relative flex items-center justify-end"
                >
                  {/* White halo marking the section (intensifies on hover). */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[-6%] top-1/2 -z-10 h-[220%] w-[150%] -translate-y-1/2 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(closest-side, rgba(255,255,255,0.18), rgba(255,255,255,0.05) 55%, transparent 78%)",
                    }}
                  />

                  {/* Wrapper carries the GSAP open/close transform so the inner
                      button's hover scale stays independent (no conflict). */}
                  <div className="nav-link">
                    <button
                      type="button"
                      className="group/btn relative flex items-center justify-end border-0 bg-transparent px-2 py-3 text-right text-white transition-transform duration-300 hover:scale-[1.04]"
                      style={{ textShadow: "0 0 20px rgba(255,255,255,0.28)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item.path);
                      }}
                    >
                      <AnimatedText
                        el="span"
                        className="relative font-urbanist text-4xl font-normal leading-none tracking-widest lowercase md:text-7xl"
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
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MenuOverlay;
