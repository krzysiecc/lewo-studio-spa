// components/Hero.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useTranslation, Trans } from "react-i18next";

import AnimatedText from "../../components/effects/AnimatedText";
import { ANIMATION_CONSTANTS } from "../../constants/animations";

export default function Hero() {
  const bigNameRef = useRef<HTMLHeadingElement>(null);
  const smallNameRef = useRef<HTMLParagraphElement>(null);
  const longTextRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bigNameRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONSTANTS.HERO.BIG_NAME_DURATION,
          ease: "power3.out",
          delay: ANIMATION_CONSTANTS.HERO.BIG_NAME_DELAY,
        },
      );
      gsap.fromTo(
        smallNameRef.current,
        { opacity: 0, y: -50 },
        {
          opacity: 1,
          y: 0,
          duration: ANIMATION_CONSTANTS.HERO.SMALL_NAME_DURATION,
          ease: "power2.inOut",
          delay: ANIMATION_CONSTANTS.HERO.SMALL_NAME_DELAY,
        },
      );

      gsap.fromTo(
        longTextRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: ANIMATION_CONSTANTS.HERO.LONG_TEXT_DURATION,
          ease: "power1.inOut",
          delay: ANIMATION_CONSTANTS.HERO.LONG_TEXT_DELAY,
        },
      );
    });

    // Cleanup function
    return () => ctx.revert();
  }, []);

  return (
    <section className="-z-10 relative min-h-screen bg-seashell-100 flex flex-col justify-between">
      {/* CENTERED MAIN BLOCK */}
      <div className="flex-grow flex items-center w-full">
        <div className="layout-grid grid-cols-12 gap-x-4 items-center">
          <div className="col-start-2 col-span-10">
            {/* "lena" is in its own div. */}
            <div ref={bigNameRef} className="text-left">
              <h1
                className="font-bold tracking-tight leading-none font-antonio"
                style={{
                  fontSize: "clamp(3.5rem, 10vw, 9rem)",
                  lineHeight: 1.0,
                }}
              >
                <span className="text-avocado-700 uppercase">
                  {t("hero.name.first")}
                </span>
                <br />
                <span className="text-avocado-700 uppercase">
                  {t("hero.name.last_part1")}
                </span>
                <span className="text-avocado-300 uppercase">
                  {t("hero.name.last_part2")}
                </span>
              </h1>
            </div>

            {/* "interior design" is in its own div, using flex to push it to the right. */}
            <div className="flex justify-end mt-2">
              <span ref={smallNameRef}>
                <AnimatedText
                  el="span"
                  className="text-base md:text-lg font-normal tracking-wider text-coffee-900"
                  text={t("hero.subtitle")}
                >
                  <Trans i18nKey={"hero.subtitle"} />
                </AnimatedText>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
