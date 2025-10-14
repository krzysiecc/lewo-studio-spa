// components/Hero.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useTranslation, Trans } from "react-i18next";

import AnimatedText from "./FX/AnimatedText";

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
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
      );
      gsap.fromTo(
        smallNameRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.inOut", delay: 0.4 }
      );

      gsap.fromTo(
        longTextRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power1.inOut", delay: 1.5 }
      );
    });

    // Cleanup function
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="-z-10 relative min-h-screen bg-seashell-100 flex flex-col justify-between">
        {/* 
        👇 THE LAYOUT CONTAINER FOR THE AURAS
        - We use 'flex' to lay them out.
        - 'absolute' and 'inset-0' makes this container fill the entire section.
        - '-z-10' puts it behind the text.
      */}
        {/* <div className="absolute inset-0 -z-10 flex flex-row">
          {/* The First Aura (Thulian Pink)
          <div className="w-full h-full">
            <InteractiveAura color="#281d15" />
          </div>
        </div> */}

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
                  <span className="text-thulian-700 uppercase">lena</span>
                  <br />
                  <span className="text-thulian-700 uppercase">wojewódz</span>
                  <span className="text-thulian-300 uppercase">ka</span>
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
    </>
  );
}
