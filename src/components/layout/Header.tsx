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
import { useNavigate } from "react-router-dom";

import gsap from "gsap";
import { ANIMATION_CONSTANTS } from "../../constants/animations";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export default function Header({ isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const navigate = useNavigate();

  const menuRef = useRef<MenuOverlayRef>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const headerColor = "#1a1a1a";

  useEffect(() => {
    const logoTarget = logoRef.current;
    const buttonTargets =
      buttonWrapperRef.current?.querySelectorAll<HTMLElement>("div, span");

    if (!logoTarget || !buttonTargets) {
      return;
    }

    const allTargets = [logoTarget, buttonTargets];

    // Clean color cross-fade: header goes white over the dark menu, back to its
    // ink color when closed. No hue-rotate/brightness filter trickery.
    gsap.to(allTargets, {
      color: isMenuOpen ? "#fefefe" : headerColor,
      fill: isMenuOpen ? "#fefefe" : headerColor,
      duration: ANIMATION_CONSTANTS.HEADER.COLOR_CHANGE_DURATION,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.set(allTargets, { filter: "none" });
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
        <div onClick={() => void navigate("/")} className="cursor-pointer">
          <LogoMain
            ref={logoRef}
            className="ml-5 w-12 md:w-20 h-auto text-[#1a1a1a] pointer-events-auto transition-all ease-in-out"
            color={headerColor}
          />
        </div>
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
