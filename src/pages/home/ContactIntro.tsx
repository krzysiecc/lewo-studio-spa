// components/home/ContactIntro.tsx

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnimatedText from "../../components/effects/AnimatedText";

export default function ContactIntro() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-avocado-900 text-seashell-100 flex items-center">
      <div className="layout-grid py-24">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-seashell-400 mb-4">
            <AnimatedText text={t("home.contactIntro.label")}>
              {t("home.contactIntro.label")}
            </AnimatedText>
          </p>
          <h2 className="font-antonio text-4xl md:text-6xl lowercase mb-4">
            <AnimatedText text={t("home.contactIntro.heading")}>
              {t("home.contactIntro.heading")}
            </AnimatedText>
          </h2>
          <p className="max-w-xl text-seashell-200/80 leading-relaxed mb-8">
            <AnimatedText text={t("home.contactIntro.body")}>
              {t("home.contactIntro.body")}
            </AnimatedText>
          </p>
          <AnimatedText text={t("home.contactIntro.cta")}>
            <button
              type="button"
              onClick={() => {
                void navigate("/contact");
              }}
              className="inline-flex items-center px-8 py-3 rounded-full border border-coffee-400/40 bg-white/30 hover:bg-avocado-800 text-sm font-mono tracking-[0.2em] uppercase cursor-pointer
        transition-colors duration-300 ease-in-out"
            >
              {t("home.contactIntro.cta")}
            </button>
          </AnimatedText>
        </div>
      </div>
    </section>
  );
}
