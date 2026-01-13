// components/layout/Header.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import MenuOverlay, { type MenuOverlayRef } from "./MenuOverlay";
import MenuButton from "./MenuButton";
import LogoMain from "../../utils/misc/LogoMain";
import LanguageSwitcher from "./LanguageSwitcher";

import gsap from "gsap";
import { ANIMATION_CONSTANTS } from "../../constants/animations";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export default function Header({ isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const menuRef = useRef<MenuOverlayRef>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const headerColor = "#281d15";

  // Detect background color beneath header
  //   useEffect(() => {
  //     const header = headerRef.current;
  //     if (!header) return;

  //     const detectBackgroundColor = () => {
  //       const headerRect = header.getBoundingClientRect();
  //       const centerX = headerRect.left + headerRect.width / 2;
  //       const centerY = headerRect.top + headerRect.height / 2;

  //       // Get element beneath header center
  //       const elementBelow = document.elementFromPoint(centerX, centerY + 50);
  //       if (!elementBelow) return;

  //       const computedStyle = window.getComputedStyle(elementBelow);
  //       const bgColor = computedStyle.backgroundColor;

  //       // Parse RGB and determine if light or dark
  //       const rgb = bgColor.match(/\d+/g);
  //       if (rgb && rgb.length >= 3) {
  //         const r = parseInt(rgb[0]);
  //         const g = parseInt(rgb[1]);
  //         const b = parseInt(rgb[2]);
  //         const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  //         // If background is light, use dark text; if dark, use light text
  //         setHeaderColor(brightness > 128 ? "#281d15" : "#fdf2ea");
  //       }
  //     };

  //     detectBackgroundColor();

  //     // Re-detect on scroll
  //     const handleScroll = () => {
  //       detectBackgroundColor();
  //     };

  //     window.addEventListener("scroll", handleScroll, { passive: true });
  //     return () => window.removeEventListener("scroll", handleScroll);
  //   }, []);

  useEffect(() => {
    const logoTarget = logoRef.current;
    const buttonTargets =
      buttonWrapperRef.current?.querySelectorAll<HTMLElement>("div, span");

    if (!logoTarget || !buttonTargets) {
      return;
    }

    const allTargets = [logoTarget, buttonTargets];

    gsap.to(allTargets, {
      color: isMenuOpen ? "#fdf2ea" : headerColor,
      fill: isMenuOpen ? "#fdf2ea" : headerColor,
      duration: 0,
      ease: "none",
      overwrite: "auto",
    });

    // The "funky" transformation
    if (isMenuOpen) {
      gsap.to(allTargets, {
        filter: "hue-rotate(120deg) brightness(1.5)",
        duration: ANIMATION_CONSTANTS.HEADER.FUNKY_TRANSFORM_DURATION,
        ease: "power2.in",
        yoyo: true,
        repeat: 1,
      });
    } else {
      gsap.set(allTargets, { filter: "hue-rotate(0deg) brightness(1)" });
    }
  }, [isMenuOpen, headerColor]);

  const handleButtonClick = () => {
    if (isMenuOpen) {
      menuRef.current?.close();
    } else {
      // 👇 3. Call the function passed down from the parent
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 right-0 w-full z-50 p-4 md:p-6 flex justify-between items-center"
      >
        <LogoMain
          ref={logoRef}
          className="ml-2 w-15 md:w-30 h-auto text-coffee-900 pointer-events-auto transition-all ease-in-out"
          color={headerColor}
        />

        <div
          ref={buttonWrapperRef}
          className="flex items-center gap-1 md:gap-4"
        >
          <LanguageSwitcher />
          <MenuButton isOpen={isMenuOpen} onClick={handleButtonClick} />
        </div>
      </header>

      {/* 
        The onClose prop is now just a fallback for the background click.
        The main state change is handled by the button click directly.
      */}
      {isMenuOpen && (
        <MenuOverlay ref={menuRef} onClose={() => setIsMenuOpen(false)} />
      )}
    </>
  );
}
