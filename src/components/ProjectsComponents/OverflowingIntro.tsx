// components/ProjectsComponents/OverflowingIntro.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import gsap from "gsap";
import AnimatedText from "../FX/AnimatedText";

export default function OverflowingIntro() {
  const textRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  useEffect(() => {
    // A simple fade-in for the text
    gsap.fromTo(
      textRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power1.inOut", delay: 1.5 }
    );
  }, []);

  return (
    <div ref={textRef} className="layout-grid grid-cols-12 opacity-0">
      <div className="col-start-2 col-span-10">
        {" "}
        <div className="font-antonio font-extralight text-coffee-900 leading-relaxed text-3xl lowercase">
          <AnimatedText
            el="span"
            className=""
            text={t("revealprojects.overflowingintro")}
          >
            <Trans></Trans>
          </AnimatedText>
        </div>
      </div>
    </div>
  );
}
