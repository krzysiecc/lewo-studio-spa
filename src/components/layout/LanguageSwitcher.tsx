// components/layout/LanguageSwitcher.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useScramble } from "@/hooks/useScramble";

/** Two-letter label for a language code, e.g. "en" -> "EN". */
const labelFor = (lang: string) => (lang || "en").slice(0, 2).toUpperCase();

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const textRef = useRef<HTMLSpanElement>(null);
  const { display, scrambleTo } = useScramble(t("langSwitcher"));

  const handleMouseEnter = () => {
    gsap.to(textRef.current, { scale: 1.1, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(textRef.current, { scale: 1.0, duration: 0.3, ease: "power2.out" });
  };

  const handleLanguageChange = () => {
    const newLang = i18n.language === "en" ? "pl" : "en";
    void i18n.changeLanguage(newLang);
  };

  // Decode toward the active language whenever it changes (incl. first mount).
  useEffect(() => {
    scrambleTo(labelFor(i18n.language));
  }, [i18n.language, scrambleTo]);

  return (
    <button
      type="button"
      onClick={handleLanguageChange}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="
        font-urbanist font-light md:text-3xl
        h-7 w-7 md:w-12
        flex items-center justify-center
        overflow-hidden
        cursor-pointer
      "
      aria-label="Change language"
    >
      <span ref={textRef} className="block tabular-nums">
        {display}
      </span>
    </button>
  );
}
