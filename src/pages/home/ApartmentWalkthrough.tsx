// pages/home/ApartmentWalkthrough.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useSharedLenis } from "../../hooks/useSharedLenis";
import AnimatedText from "../../components/effects/AnimatedText";
import FilamentBulbs from "../../components/effects/FilamentBulbs";
import Noise from "../../components/effects/Noise";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Floor plan — a real, functional (uneven) apartment laid out on a 2D plane in
// world pixels. The camera tours rooms in array order; between each it pulls
// back to reveal the plan, then dives into the next ("oddalenie i kolejny pokój").
// ---------------------------------------------------------------------------

type RoomId = "entrance" | "living" | "kitchen" | "studio" | "bedroom" | "exit";

interface RoomGeom {
  id: RoomId;
  num: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

const ROOMS: RoomGeom[] = [
  { id: "entrance", num: "01", cx: 620, cy: 1500, w: 520, h: 800 },
  { id: "living", num: "02", cx: 1780, cy: 1140, w: 1540, h: 1140 },
  { id: "kitchen", num: "03", cx: 1700, cy: 2160, w: 1160, h: 640 },
  { id: "studio", num: "04", cx: 3190, cy: 1140, w: 920, h: 860 },
  { id: "bedroom", num: "05", cx: 3220, cy: 2120, w: 840, h: 740 },
  { id: "exit", num: "06", cx: 4000, cy: 1640, w: 580, h: 560 },
];

const WORLD_W = 4700;
const WORLD_H = 2900;

export default function ApartmentWalkthrough() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lenisRef = useSharedLenis();

  const sectionRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const world = worldRef.current;
    const section = sectionRef.current;
    if (!world || !section) return;

    const lenis = lenisRef.current;
    // Keep ScrollTrigger in lock-step with Lenis' smoothed scroll position.
    const onLenisScroll = () => ScrollTrigger.update();
    lenis?.on("scroll", onLenisScroll);

    const ctx = gsap.context(() => {
      // Camera transform that frames a given room centred in the viewport.
      const fill = 0.82;
      const cam = (r: RoomGeom) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const s = Math.min(vw / r.w, vh / r.h) * fill;
        return { x: vw / 2 - r.cx * s, y: vh / 2 - r.cy * s, scale: s };
      };
      // Pulled-back camera revealing both rooms (the "zoom out" beat).
      const pull = (a: RoomGeom, b: RoomGeom) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cx = (a.cx + b.cx) / 2;
        const cy = (a.cy + b.cy) / 2;
        const spanW = Math.abs(a.cx - b.cx) + Math.max(a.w, b.w);
        const spanH = Math.abs(a.cy - b.cy) + Math.max(a.h, b.h);
        const s = Math.min(vw / spanW, vh / spanH) * 0.62;
        return { x: vw / 2 - cx * s, y: vh / 2 - cy * s, scale: s };
      };

      gsap.set(world, { transformOrigin: "0 0" });

      const contents = gsap.utils.toArray<HTMLElement>(".room-content");
      gsap.set(contents, { opacity: 0.3 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Initial framing on room 0 (function values re-evaluate on refresh).
      tl.to(
        world,
        {
          x: () => cam(ROOMS[0]).x,
          y: () => cam(ROOMS[0]).y,
          scale: () => cam(ROOMS[0]).scale,
          duration: 0,
        },
        0,
      );
      tl.to(contents[0], { opacity: 1, duration: 0.4 }, 0);

      let at = 0;
      for (let i = 0; i < ROOMS.length - 1; i++) {
        const a = ROOMS[i];
        const b = ROOMS[i + 1];

        // Pull back to reveal the plan, dimming the room we're leaving.
        tl.to(
          world,
          {
            x: () => pull(a, b).x,
            y: () => pull(a, b).y,
            scale: () => pull(a, b).scale,
            duration: 1,
            ease: "power2.inOut",
          },
          at,
        );
        tl.to(contents[i], { opacity: 0.3, duration: 0.6 }, at);
        at += 1;

        // Dive into the next room, brightening its content.
        tl.to(
          world,
          {
            x: () => cam(b).x,
            y: () => cam(b).y,
            scale: () => cam(b).scale,
            duration: 1,
            ease: "power2.inOut",
          },
          at,
        );
        tl.to(contents[i + 1], { opacity: 1, duration: 0.6 }, at + 0.35);
        at += 1;
      }

      // Layout may settle after fonts/Lenis init — refresh once mounted.
      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      lenis?.off("scroll", onLenisScroll);
      ctx.revert();
    };
  }, [lenisRef]);

  // --- Per-room content (reuses existing i18n copy; closes over t/navigate).
  // Text is sized relative to room height so it reads consistently when framed.
  const roomContent = (room: RoomGeom): ReactNode => {
    const h = room.h;
    const go = (path: string) => () => void navigate(path);

    const title = (size: number, text: string) => (
      <h2
        className="font-urbanist font-bold lowercase leading-[0.9]"
        style={{ fontSize: h * size }}
      >
        <AnimatedText text={text}>{text}</AnimatedText>
      </h2>
    );
    const line = (size: number, text: string, cls = "text-white/70") => (
      <p
        className={`font-urbanist leading-snug ${cls}`}
        style={{ fontSize: h * size, marginTop: h * 0.025 }}
      >
        <AnimatedText text={text}>{text}</AnimatedText>
      </p>
    );
    const cta = (label: string, onClick: () => void) => (
      <button
        type="button"
        onClick={onClick}
        className="mt-[5%] inline-flex cursor-pointer items-center rounded-full border border-white/40 bg-white/5 font-space-mono uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white/15"
        style={{ fontSize: h * 0.026, padding: `${h * 0.022}px ${h * 0.05}px` }}
      >
        {label}
      </button>
    );

    switch (room.id) {
      case "entrance":
        return (
          <>
            {title(
              0.14,
              `${t("hero.name.first")} ${t("hero.name.last_part1")}${t("hero.name.last_part2")}`,
            )}
            {line(0.04, t("hero.subtitle"), "text-white/55 tracking-[0.3em]")}
          </>
        );
      case "living":
        return (
          <>
            {title(0.11, t("home.aboutIntro.heading"))}
            {line(0.035, t("home.aboutIntro.body"))}
          </>
        );
      case "kitchen":
        return (
          <>
            {title(0.13, t("home.apartment.kitchen"))}
            {line(0.05, t("home.aboutIntro.body"), "text-white/60")}
          </>
        );
      case "studio":
        return (
          <>
            {title(0.12, t("home.projectsIntro.heading"))}
            {line(0.04, t("home.projectsIntro.body"))}
            {cta(t("home.projectsIntro.cta"), go("/projects"))}
          </>
        );
      case "bedroom":
        return title(0.1, t("home.contactIntro.heading"));
      case "exit":
        return (
          <>
            {title(0.13, t("home.apartment.exit"))}
            {cta(t("home.contactIntro.cta"), go("/contact"))}
          </>
        );
    }
  };

  return (
    // Tall scroll track; the stage inside is sticky and acts as the camera frame.
    <section ref={sectionRef} className="relative h-[600vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black text-white">
        {/* WORLD — the apartment plane the camera moves over */}
        <div
          ref={worldRef}
          className="absolute left-0 top-0"
          style={{ width: WORLD_W, height: WORLD_H }}
        >
          {ROOMS.map((room) => (
            <article
              key={room.id}
              className="absolute flex flex-col overflow-hidden"
              style={{
                left: room.cx - room.w / 2,
                top: room.cy - room.h / 2,
                width: room.w,
                height: room.h,
                border: "1px solid rgba(255,255,255,0.16)",
                background:
                  "linear-gradient(160deg, #0b0b0b 0%, #050505 60%, #000 100%)",
                boxShadow: "inset 0 0 120px rgba(255,255,255,0.05)",
              }}
            >
              {/* Window light spilling into the room (light-only accent). */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 85% 0%, rgba(255,255,255,0.16) 0%, transparent 55%)",
                }}
              />

              {/* Floor-plan marker — faintly legible from the plan view. */}
              <div
                className="absolute left-0 top-0 font-space-mono uppercase tracking-[0.35em] text-white/45"
                style={{ padding: room.h * 0.05, fontSize: room.h * 0.035 }}
              >
                {room.num} · {t(`home.apartment.${room.id}`)}
              </div>

              {/* Bulbs in the larger living spaces, like ceiling lamps. */}
              {(room.id === "living" || room.id === "studio") && (
                <FilamentBulbs count={8} minSize={6} maxSize={14} />
              )}

              <div className="room-content relative z-10 flex h-full w-full flex-col items-center justify-center px-[6%] text-center">
                {roomContent(room)}
              </div>
            </article>
          ))}
        </div>

        {/* Light + grain overlays (no colour) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              "radial-gradient(circle at center, transparent 52%, rgba(0,0,0,0.88) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-30 opacity-60">
          <Noise patternAlpha={13} />
        </div>
      </div>
    </section>
  );
}
