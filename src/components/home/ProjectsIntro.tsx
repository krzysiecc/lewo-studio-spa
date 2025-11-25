// components/home/ProjectsIntro.tsx

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AnimatedText from "../FX/AnimatedText";

export default function ProjectsIntro() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-seashell-100 text-coffee-900 flex items-center">
      <div className="layout-grid py-24">
        <div className="col-span-12 md:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-coffee-500 mb-4">
            <AnimatedText text={t("home.projectsIntro.label")}>
              {t("home.projectsIntro.label")}
            </AnimatedText>
          </p>
          <h2 className="font-antonio text-4xl md:text-6xl lowercase text-avocado-700 text-glow mb-4">
            <AnimatedText text={t("home.projectsIntro.heading")}>
              {t("home.projectsIntro.heading")}
            </AnimatedText>
          </h2>
          <p className="max-w-xl text-coffee-700 leading-relaxed mb-8">
            <AnimatedText text={t("home.projectsIntro.body")}>
              {t("home.projectsIntro.body")}
            </AnimatedText>
          </p>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="inline-flex items-center px-6 py-3 rounded-full border border-seashell-300/60 bg-coffee-800/40 hover:bg-coffee-700/60 text-sm font-mono tracking-[0.2em] uppercase"
          >
            {t("home.projectsIntro.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
