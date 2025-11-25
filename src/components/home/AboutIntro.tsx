// components/home/AboutIntro.tsx

import { useTranslation } from "react-i18next";
import AnimatedText from "../FX/AnimatedText";

export default function AboutIntro() {
  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-avocado-900 text-seashell-100 flex items-center">
      <div className="layout-grid py-24">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-seashell-400 mb-4">
            <AnimatedText text={t("home.aboutIntro.label")}>
              {t("home.aboutIntro.label")}
            </AnimatedText>
          </p>
          <h2 className="font-antonio text-4xl md:text-6xl lowercase mb-4">
            <AnimatedText text={t("home.aboutIntro.heading")}>
              {t("home.aboutIntro.heading")}
            </AnimatedText>
          </h2>
          <p className="font-antonio font-extralight max-w-2xl text-seashell-300 leading-relaxed">
            {(() => {
              const body = t("home.aboutIntro.body");
              const idx = body.lastIndexOf(" ");
              if (idx === -1) return body;
              return (
                <>
                  {body.slice(0, idx + 1)}
                  <span className="font-bold">{body.slice(idx + 1)}</span>
                </>
              );
            })()}
          </p>
        </div>
      </div>
    </section>
  );
}
