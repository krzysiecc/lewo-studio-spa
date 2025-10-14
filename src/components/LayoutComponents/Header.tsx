// components/LayoutComponents/Header.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import MenuOverlay, { type MenuOverlayRef } from "../MenuOverlay";
import MixerButton from "./MixerButton";
import LogoMain from "../Logos/LogoMain";
import LogoMainSecure from "../Logos/LogoMainSecure";
import LanguageSwitcher from "./LanguageSwitcher";

import gsap from "gsap";

type HeaderProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
};

export default function Header({ isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const menuRef = useRef<MenuOverlayRef>(null);

  const logoRef = useRef<SVGSVGElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logoTarget = logoRef.current;
    const buttonTargets =
      buttonWrapperRef.current?.querySelectorAll("div, span");

    // 👇 --- THE FIX IS HERE ---
    // This is a "guard clause". If the elements don't exist yet,
    // exit the function early. This makes TypeScript happy and is safer.
    if (!logoTarget || !buttonTargets) {
      return;
    }

    // --- The Animations ---
    // We animate both targets together for perfect synchronization
    const allTargets = [logoTarget, buttonTargets];

    gsap.to(allTargets, {
      color: isMenuOpen ? "#fdf2ea" : "#281d15",
      fill: isMenuOpen ? "#fdf2ea" : "#281d15",
      duration: 0.8,
      ease: "power3.inOut",
      overwrite: "auto",
    });

    // The "funky" transformation
    if (isMenuOpen) {
      gsap.to(allTargets, {
        filter: "hue-rotate(120deg) brightness(1.5)",
        duration: 0.4,
        ease: "power2.in",
        yoyo: true,
        repeat: 1,
      });
    } else {
      // Instantly reset the filter on close to prevent weird flashes
      gsap.set(allTargets, { filter: "hue-rotate(0deg) brightness(1)" });
    }
  }, [isMenuOpen]);

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
      <header className="fixed top-0 right-0 w-full z-50 p-4 md:p-6 flex justify-between items-center">
        <LogoMain
          ref={logoRef}
          className="ml-2 w-15 md:w-25 h-auto text-coffee-900 pointer-events-auto transition-all ease-in-out"
        />

        <div
          ref={buttonWrapperRef}
          className="flex items-center gap-1 md:gap-4"
        >
          <LanguageSwitcher />
          <MixerButton isOpen={isMenuOpen} onClick={handleButtonClick} />
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
