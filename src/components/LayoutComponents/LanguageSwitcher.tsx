// components/LayoutComponents/LanguageSwitcher.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useTranslation } from "react-i18next";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const textRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    gsap.to(textRef.current, {
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(textRef.current, {
      scale: 1.0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleLanguageChange = () => {
    // Animate out the old text
    gsap.to(textRef.current, {
      yPercent: -100,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        // Change language
        const newLang = i18n.language === "en" ? "pl" : "en";
        i18n.changeLanguage(newLang);
        // Instantly move the text to the bottom, ready to animate in
        gsap.set(textRef.current, { yPercent: 100 });
        // Animate in the new text
        gsap.to(textRef.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      },
    });
  };

  // This effect ensures the text updates if the language changes elsewhere
  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(
        textRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [i18n.language]);

  return (
    <button
      ref={buttonRef}
      onClick={handleLanguageChange}
      onMouseEnter={handleMouseEnter} // Add mouse enter event
      onMouseLeave={handleMouseLeave} // Add mouse leave event
      className="
        font-antonio font-light text-xl md:text-3xl
        h-10 w-12 // Larger size
        flex items-center justify-center 
        overflow-hidden 
        cursor-pointer
      "
      aria-label="Change language"
    >
      <span ref={textRef} className="block">
        {t("langSwitcher")}
      </span>

      {/* The extra underline span has been removed */}
    </button>
  );
}
