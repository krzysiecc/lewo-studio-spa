![Status: Work in Progress](https://img.shields.io/badge/status-work--in--progress-yellow)
![License: BSD-2-Clause](https://img.shields.io/badge/license-BSD--2--Clause-brightgreen)
![Language: TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?logo=typescript&logoColor=white)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-Animation-88CE02?logo=greensock&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)
![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-FFC300)
![i18next](https://img.shields.io/badge/i18next-EN_%2F_PL-26A69A?logo=i18next&logoColor=white)

![Design: Maximalist](https://img.shields.io/badge/design-maximalist-ff69b4) ![Text: Minimal](https://img.shields.io/badge/text-minimal-blue) ![Scroll: No Arrows](https://img.shields.io/badge/scroll-no--arrows-important) ![Style: Not Just Pinterest](https://img.shields.io/badge/style-not--just--pinterest-critical)

# Lewo Studio — Portfolio for Lena Wojewódzka

A bilingual (🇬🇧 EN / 🇵🇱 PL), animation-driven single-page portfolio for an interior-design studio. Built as a modern React SPA with buttery smooth scrolling, custom canvas/SVG effects, and a fully translated **KNSSD** branding case study.

> The site is deliberately **vivid, bold and visually dynamic** with minimal text — vertical scrolling is intuitive, with no arrows or "scroll down" prompts. The full creative brief lives further down this README.

---

## Tech Stack

| Area                   | Tools                                                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Core**               | React 19, React Router 7, TypeScript ~5.8                                                                            |
| **Build**              | Vite 7                                                                                                               |
| **Styling**            | Tailwind CSS v4 (CSS-first `@theme` in `src/styles/index.css`), `tailwind-merge`, `class-variance-authority`, `clsx` |
| **Animation & scroll** | GSAP 3 (+ ScrollTrigger), Framer Motion 12, Lenis smooth scroll                                                      |
| **i18n**               | i18next + react-i18next (`http-backend` + language detector)                                                         |
| **Icons / fonts**      | Heroicons, Lucide; local Futura & Gilmer web fonts                                                                   |
| **Tooling**            | ESLint 9, Prettier 3, `gh-pages`                                                                                     |

## Project Structure

```
lewo-studio-spa/
├── public/
│   ├── assets/
│   │   ├── img/                  # logos, noise + placeholder imagery
│   │   └── knssd/                # KNSSD case-study assets incl. 60-frame coin/ sequence
│   └── locales/{en, pl}/         # i18next JSON (translation.json, knssd.json)
├── src/
│   ├── main.tsx                  # entry: StrictMode + Suspense + BrowserRouter
│   ├── App.tsx                   # routes + LenisProvider
│   ├── i18n.ts                   # i18next configuration
│   ├── assets/fonts/             # Futura + Gilmer
│   ├── components/
│   │   ├── effects/              # AnimatedText, FibersCanvas, FiberHelpers, Noise, MenuBackground
│   │   ├── layout/               # Layout, Header, MenuOverlay, MenuButton, LanguageSwitcher
│   │   ├── ImageSequence.tsx · LogoLoop.tsx · MagnetLines.tsx · ScrollStack.tsx
│   ├── context/                  # LenisProvider + LenisContext (smooth scroll)
│   ├── hooks/                    # useSharedLenis
│   ├── constants/                # animations.ts (shared timings)
│   ├── lib/                      # utils.ts (cn class-merge helper)
│   ├── pages/{home, projects, contact}/
│   ├── styles/index.css          # Tailwind v4 @theme + font faces
│   └── utils/                    # fxBridge.ts, misc/LogoMain.tsx
├── eslint.config.js · vite.config.ts · tsconfig*.json · components.json
└── package.json
```

**Routes:** `/` Home · `/projects` · `/projects/2025-knssd` (KNSSD case study) · `/contact`

## Getting Started

**Prerequisites:** Node `>= 20.19` and npm.

```bash
npm install
npm run dev        # → http://localhost:5173
```

### Scripts

| Script            | What it does                                 |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                    |
| `npm run build`   | Type-check (`tsc -b`) then bundle to `dist/` |
| `npm run preview` | Serve the production build locally           |
| `npm run lint`    | Run ESLint over the project                  |
| `npm run format`  | Format the codebase with Prettier            |
| `npm run deploy`  | Build and publish `dist/` to GitHub Pages    |

## Internationalization

Copy lives in `public/locales/{en,pl}/` — `translation.json` for general content and `knssd.json` for the case study. Translations load at runtime via `i18next-http-backend` and are toggled with the in-app language switcher (browser language is auto-detected on first visit).

## Signature Features

- **Animated Fibers** — a bespoke SVG system that draws animated, curved "fiber" connectors between any two UI elements (powering the menu overlay). See [FIBERS_README.md](FIBERS_README.md).
- **KNSSD case study** — a scroll-driven branding showcase with a clip-path pattern reveal, a 60-frame canvas "coin" animation, and a copy-to-clipboard color system (RGB / CMYK / HEX).
- **Ambient effects** — procedural film grain, magnetic line grids, scroll-stacking cards, and blur/slide text reveals.

## Deployment

The site ships to **GitHub Pages**: `npm run deploy` runs the build and pushes the contents of `dist/` via `gh-pages`.

---

# Project Brief

## Color Palette

|           |                                                                    |     |
| :-------: | :----------------------------------------------------------------: | :-: |
| `#D483A7` |  ![#D483A7](https://placehold.co/100x40/D483A7/FFF?text=Thulian)   |     |
| `#FDF2EA` |  ![#FDF2EA](https://placehold.co/100x40/FDF2EA/000?text=Seashell)  |     |
| `#6C4D3F` |   ![#6C4D3F](https://placehold.co/100x40/6C4D3F/FFF?text=Coffee)   |     |
| `#97BBDC` | ![#97BBDC](https://placehold.co/100x40/97BBDC/FFF?text=PowderBlue) |     |
| `#5B6F05` |  ![#5B6F05](https://placehold.co/100x40/5B6F05/FFF?text=Avocado)   |     |

## Overview

- The website should be **vivid, bold, and visually dynamic**, with minimal text.
- The design must encourage intuitive vertical scrolling, without explicit scroll indicators or instructions.

## Main Page

- Prominently display the **name** in large typography.
- The layout should hint at additional content below the fold, either by cropping text or using partial images.
- No arrows or “scroll down” prompts.

## Navigation

- Menu sections: `Home`, `About`, `Projects`, `Contact`.  
  (Optional: Q&A section in the future.)
- The menu spans the full or half width of the page.
- On scroll, the menu transforms into a centered hamburger menu; the name transitions into a logo.

## Visual Consistency

- A unified color palette is required across all pages.

## Content Structure

- Below the main header, display two project tiles with hover effects (e.g., grayscale overlay and “read more”).
- Include carousel navigation for additional projects.
- Insert a brief quote or statement about creating interiors that reflect individual style and personality.
- Add a profile photo and a concise “About” section.
- Conclude with contact information, a prominent headline, and a visually distinctive footer.

## Subpages

- **About:** Extended biography and supplementary images.
- **Contact:** Contact details and potentially a contact form.
- **Projects:** Gallery of project tiles.

## Additional Notes

- The main page content should be highly condensed; detailed information is available via menu sections.
- The tone should remain professional yet approachable.
- The site should highlight versatility in design styles, not limited to a single aesthetic.

**Inspiration**

- [dpt.co](https://dpt.co/en/) ← heavy inspo
- [kellywearstler.com](https://www.kellywearstler.com/home)
- [strv.com](https://www.strv.com/)
- [aristidebenoist.com](https://aristidebenoist.com/)
- [mamashelter.com](https://mamashelter.com/)
- [deanira.co](https://www.deanira.co/onestopshop)
- [buzzworthystudio.com](https://buzzworthystudio.com/)
- [lxtrendship.com](https://www.lxtrendship.com/en)
- [radicalface.com](https://www.radicalface.com/) ← heavy inspo

## License

This project is licensed under the [BSD 2-Clause License](LICENSE):

- Free for personal and commercial use.
- Redistribution and modification permitted, provided copyright and license notices are retained.
- No warranty is provided.

_Further development and content expansion are anticipated as the project progresses._
