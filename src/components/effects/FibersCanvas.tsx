import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

export interface Point {
  x: number;
  y: number;
}

export type FiberDirection =
  | "auto"
  | "leftToRight"
  | "rightToLeft"
  | "topToBottom"
  | "bottomToTop";

export type FiberCurve = "trochoid" | "wave";

export type FiberEndpointSource =
  | {
      type: "point";
      point: Point;
    }
  | {
      type: "anchor";
      anchor: { xPct: number; yPct: number };
    }
  | {
      type: "element";
      element: HTMLElement | null;
      attach?: "center" | "left" | "right" | "top" | "bottom";
    };

export type FiberEndpointDecoration =
  | {
      type: "none";
    }
  | {
      type: "icon";
      Icon: React.ComponentType<{
        size?: number;
        color?: string;
        strokeWidth?: number;
      }>;
      size?: number;
      dimOpacity?: number;
      glow?: boolean;
      strokeWidth?: number;
    }
  | {
      type: "button";
      ariaLabel: string;
      className?: string;
      onClick?: () => void;
      children?: React.ReactNode;
    };

export interface FiberStyle {
  color: string;
  baseStrokeWidth?: number;
  baseOpacity?: number;
  highlightStrokeWidth?: number;
  highlightGlow?: { blur1?: number; blur2?: number };
}

export interface FiberPhysics {
  direction?: FiberDirection;
  curve?: FiberCurve;
  smoothness?: number; // catmull-rom tension
  segments?: number; // resolution
  leadInPx?: number; // clean lead-in along main axis

  // Wave params
  amplitudePx?: number;
  cycles?: number;

  // Trochoid params
  radiusPx?: number;
  curlAspect?: number; // x scaling for loops (0..1)
  curlReverse?: boolean;

  seed?: number;
}

export interface FiberSpec {
  id: string;
  start: FiberEndpointSource;
  end: FiberEndpointSource;
  startOffset?: Point;
  endOffset?: Point;

  style: FiberStyle;
  physics?: FiberPhysics;

  startDecoration?: FiberEndpointDecoration;
  endDecoration?: FiberEndpointDecoration;

  // Optional active animation hook
  isActive?: boolean;
}

export interface FibersCanvasProps {
  containerRef: React.RefObject<HTMLElement>;
  fibers: FiberSpec[];
  className?: string;

  // When true, disables highlight animation entirely
  enableHighlight?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catmullRomToBezier(points: Point[], tension = 1) {
  if (points.length < 2) return "";
  const t = clamp(tension, 0, 2);

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1: Point = {
      x: p1.x + ((p2.x - p0.x) * t) / 6,
      y: p1.y + ((p2.y - p0.y) * t) / 6,
    };
    const c2: Point = {
      x: p2.x - ((p3.x - p1.x) * t) / 6,
      y: p2.y - ((p3.y - p1.y) * t) / 6,
    };

    parts.push(`C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`);
  }

  return parts.join(" ");
}

function resolveEndpoint(
  containerEl: HTMLElement,
  source: FiberEndpointSource,
  offset?: Point,
): Point {
  const containerRect = containerEl.getBoundingClientRect();

  const base: Point = (() => {
    switch (source.type) {
      case "point":
        return source.point;
      case "anchor":
        return {
          x: containerRect.width * source.anchor.xPct,
          y: containerRect.height * source.anchor.yPct,
        };
      case "element": {
        const el = source.element;
        if (!el) {
          // Fallback to center if element not available
          return {
            x: containerRect.width * 0.5,
            y: containerRect.height * 0.5,
          };
        }

        const r = el.getBoundingClientRect();
        const attach = source.attach ?? "center";

        // Guard against invalid rect values
        if (
          !isFinite(r.left) ||
          !isFinite(r.top) ||
          !isFinite(r.width) ||
          !isFinite(r.height)
        ) {
          return {
            x: containerRect.width * 0.5,
            y: containerRect.height * 0.5,
          };
        }

        const x =
          attach === "left"
            ? r.left
            : attach === "right"
              ? r.right
              : r.left + r.width / 2;

        const y =
          attach === "top"
            ? r.top
            : attach === "bottom"
              ? r.bottom
              : r.top + r.height / 2;

        return { x: x - containerRect.left, y: y - containerRect.top };
      }
    }
  })();

  return {
    x: base.x + (offset?.x ?? 0),
    y: base.y + (offset?.y ?? 0),
  };
}

function resolveDirection(
  start: Point,
  end: Point,
  direction: FiberDirection,
): FiberDirection {
  if (direction !== "auto") return direction;

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "leftToRight" : "rightToLeft";
  }

  return dy >= 0 ? "topToBottom" : "bottomToTop";
}

function unit(v: Point): Point {
  const l = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / l, y: v.y / l };
}

function makeFiberPath(params: {
  start: Point;
  end: Point;
  physics: Required<
    Pick<
      FiberPhysics,
      | "curve"
      | "direction"
      | "smoothness"
      | "segments"
      | "leadInPx"
      | "amplitudePx"
      | "cycles"
      | "radiusPx"
      | "curlAspect"
      | "curlReverse"
      | "seed"
    >
  >;
}) {
  const { start, end, physics } = params;

  const rnd = mulberry32(physics.seed);
  const rand = (min: number, max: number) => min + (max - min) * rnd();

  const dir = resolveDirection(start, end, physics.direction);

  const tangent = unit({ x: end.x - start.x, y: end.y - start.y });
  const normal = { x: -tangent.y, y: tangent.x };

  const totalLen = Math.hypot(end.x - start.x, end.y - start.y) || 1;

  const lead = clamp(physics.leadInPx, 0, totalLen * 0.6);

  const leadVec: Point = (() => {
    switch (dir) {
      case "leftToRight":
        return { x: 1, y: 0 };
      case "rightToLeft":
        return { x: -1, y: 0 };
      case "topToBottom":
        return { x: 0, y: 1 };
      case "bottomToTop":
        return { x: 0, y: -1 };
      case "auto":
        return tangent;
    }
  })();

  const p1: Point = {
    x: start.x + leadVec.x * lead,
    y: start.y + leadVec.y * lead,
  };

  const pts: Point[] = [start, p1];

  const segments = clamp(Math.floor(physics.segments), 8, 300);

  if (physics.curve === "wave") {
    const cycles = physics.cycles > 0 ? physics.cycles : 2;
    const freq = Math.PI * 2 * cycles;
    const phase = rand(0, Math.PI * 2);

    for (let k = 1; k < segments; k++) {
      const t = k / segments;
      const baseX = p1.x + (end.x - p1.x) * t;
      const baseY = p1.y + (end.y - p1.y) * t;

      const envelope = Math.sin(t * Math.PI);
      const a = physics.amplitudePx * envelope;

      const oy = Math.sin(t * freq + phase) * a;

      pts.push({
        x: baseX + normal.x * oy,
        y: baseY + normal.y * oy,
      });
    }
  } else {
    // trochoid (coil-like loops) similar to current MenuOverlay implementation
    const cycles = 2.5 + rand(0, 1.5);
    const freq = Math.PI * 2 * cycles;
    const phase = rand(0, Math.PI * 2);

    for (let k = 1; k < segments; k++) {
      const t = k / segments;
      const baseX = p1.x + (end.x - p1.x) * t;
      const baseY = p1.y + (end.y - p1.y) * t;

      const envelope = Math.sin(t * Math.PI);
      const radius = physics.radiusPx * envelope;

      const angle = t * freq + phase;

      const oy = Math.sin(angle) * radius;
      const curlSign = physics.curlReverse ? -1 : 1;
      const ox = Math.cos(angle) * radius * physics.curlAspect * curlSign;

      // move along normal (oy) and against tangent (ox)
      pts.push({
        x: baseX + normal.x * oy - tangent.x * ox,
        y: baseY + normal.y * oy - tangent.y * ox,
      });
    }
  }

  pts.push(end);

  return {
    d: catmullRomToBezier(pts, physics.smoothness),
  };
}

function decorationIsButton(
  d?: FiberEndpointDecoration,
): d is Extract<FiberEndpointDecoration, { type: "button" }> {
  return !!d && d.type === "button";
}

function decorationIsIcon(
  d?: FiberEndpointDecoration,
): d is Extract<FiberEndpointDecoration, { type: "icon" }> {
  return !!d && d.type === "icon";
}

export default function FibersCanvas(props: FibersCanvasProps) {
  const { containerRef, fibers, className, enableHighlight = true } = props;

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [geom, setGeom] = useState<
    (FiberSpec & {
      startPoint: Point;
      endPoint: Point;
      endIconPoint: Point;
    })[]
  >([]);

  const highlightRefs = useRef<Record<string, SVGPathElement | null>>({});
  const glowIconRefs = useRef<Record<string, SVGGElement | null>>({});
  const dashInitStateRef = useRef<Record<string, { d: string; len: number }>>(
    {},
  );

  const compute = useCallback(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const rect = containerEl.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    setSize({ width, height });

    const next = fibers.map((f) => {
      const startPoint = resolveEndpoint(containerEl, f.start, f.startOffset);
      const endPoint = resolveEndpoint(containerEl, f.end, f.endOffset);
      const endIconPoint = resolveEndpoint(containerEl, f.end, undefined);
      return { ...f, startPoint, endPoint, endIconPoint };
    });

    setGeom(next);
  }, [containerRef, fibers]);

  useLayoutEffect(() => {
    compute();

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const ro = new ResizeObserver(() => compute());
    ro.observe(containerEl);

    const onResize = () => compute();
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [compute, containerRef]);

  const svgPaths = useMemo(() => {
    return geom.map((f) => {
      const physics: Required<
        Pick<
          FiberPhysics,
          | "curve"
          | "direction"
          | "smoothness"
          | "segments"
          | "leadInPx"
          | "amplitudePx"
          | "cycles"
          | "radiusPx"
          | "curlAspect"
          | "curlReverse"
          | "seed"
        >
      > = {
        curve: f.physics?.curve ?? "trochoid",
        direction: f.physics?.direction ?? "auto",
        smoothness: f.physics?.smoothness ?? 1.0,
        segments: f.physics?.segments ?? 50,
        leadInPx: f.physics?.leadInPx ?? 120,
        amplitudePx: f.physics?.amplitudePx ?? 34,
        cycles: f.physics?.cycles ?? 2.5,
        radiusPx: f.physics?.radiusPx ?? 60,
        curlAspect: f.physics?.curlAspect ?? 0.6,
        curlReverse: f.physics?.curlReverse ?? true,
        seed: f.physics?.seed ?? 20260112,
      };

      const { d } = makeFiberPath({
        start: f.startPoint,
        end: f.endPoint,
        physics,
      });

      return { id: f.id, d, fiber: f };
    });
  }, [geom]);

  // Initialize dash lengths when paths change
  useLayoutEffect(() => {
    if (!enableHighlight) return;

    for (const p of svgPaths) {
      const pathEl = highlightRefs.current[p.id];
      if (!pathEl) continue;
      const len = pathEl.getTotalLength();

      const prev = dashInitStateRef.current[p.id];
      const needsInit =
        !prev ||
        prev.d !== p.d ||
        prev.len !== len ||
        !pathEl.style.strokeDasharray;

      // IMPORTANT: don't reset dash/opacity on mere hover state changes.
      // We only re-init when the actual geometry changed (e.g. resize/layout).
      if (needsInit) {
        dashInitStateRef.current[p.id] = { d: p.d, len };
        pathEl.style.strokeDasharray = `${len}`;
        pathEl.style.strokeDashoffset = `${len}`;
        gsap.set(pathEl, { opacity: p.fiber.isActive ? 1 : 0 });
      }

      const iconEl = glowIconRefs.current[p.id];
      if (iconEl && needsInit)
        gsap.set(iconEl, {
          opacity: 0,
          scale: 0.9,
          transformOrigin: "50% 50%",
        });
    }
  }, [svgPaths, enableHighlight]);

  // Active animations per fiber
  useLayoutEffect(() => {
    if (!enableHighlight) return;

    for (const p of svgPaths) {
      const isActive = !!p.fiber.isActive;
      const pathEl = highlightRefs.current[p.id];
      const iconEl = glowIconRefs.current[p.id];
      if (!pathEl) continue;

      const len = pathEl.getTotalLength();
      gsap.killTweensOf(pathEl);
      if (iconEl) gsap.killTweensOf(iconEl);

      const getNumericProp = (el: Element, prop: string, fallback: number) => {
        const v = gsap.getProperty(el, prop);
        const n = typeof v === "number" ? v : parseFloat(String(v));
        return Number.isFinite(n) ? n : fallback;
      };

      const currentDash = getNumericProp(pathEl, "strokeDashoffset", len);
      const currentOpacity = getNumericProp(pathEl, "opacity", 0);

      // Base timings (scaled to remaining distance so hover/unhover feels seamless)
      const IN_BASE = 1.6;
      const OUT_BASE = 1.15;
      const minDur = 0.18;
      const inDur = clamp(
        IN_BASE * (Math.abs(currentDash - 0) / (len || 1)),
        minDur,
        IN_BASE,
      );
      const outDur = clamp(
        OUT_BASE * (Math.abs(len - currentDash) / (len || 1)),
        minDur,
        OUT_BASE,
      );

      if (!isActive) {
        // If already hidden, keep it parked at the start state without animating.
        if (currentOpacity <= 0.01) {
          gsap.set(pathEl, { strokeDashoffset: len, opacity: 0 });
          if (iconEl) {
            gsap.set(iconEl, {
              opacity: 0,
              scale: 0.9,
              transformOrigin: "50% 50%",
            });
          }
          continue;
        }

        // Smooth "unfollow": retract the glow back along the path, then fade.
        const tl = gsap.timeline();
        tl.set(pathEl, { opacity: 1 });
        tl.to(pathEl, {
          strokeDashoffset: len,
          duration: outDur,
          ease: "power2.inOut",
        });
        tl.to(
          pathEl,
          {
            opacity: 0,
            duration: 0.22,
            ease: "power2.out",
          },
          ">-0.06",
        );

        // End icon glow should "unglow" immediately when leaving.
        if (iconEl) {
          tl.to(
            iconEl,
            {
              opacity: 0,
              scale: 0.9,
              duration: 0.25,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            },
            0,
          );
        }
        continue;
      }

      // Smooth "follow": continue from wherever the dash currently is.
      if (currentOpacity <= 0.01) {
        // If coming from fully hidden, ensure it's visible and ready.
        gsap.set(pathEl, { opacity: 1 });
      } else {
        gsap.set(pathEl, { opacity: 1 });
      }

      gsap.to(pathEl, {
        strokeDashoffset: 0,
        duration: inDur,
        ease: "power2.out",
      });

      if (iconEl) {
        const iconDelay = clamp(inDur - 0.45, 0, inDur);
        gsap.to(iconEl, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "power3.out",
          delay: iconDelay,
          transformOrigin: "50% 50%",
        });
      }
    }
  }, [svgPaths, enableHighlight]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      {/* SVG layer */}
      <svg
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        {svgPaths.map(({ id, d, fiber }) => {
          const color = fiber.style.color;
          const baseStrokeWidth = fiber.style.baseStrokeWidth ?? 2;
          const baseOpacity = fiber.style.baseOpacity ?? 0.5;
          const highlightStrokeWidth = fiber.style.highlightStrokeWidth ?? 3;
          const blur1 = fiber.style.highlightGlow?.blur1 ?? 10;
          const blur2 = fiber.style.highlightGlow?.blur2 ?? 22;

          const startDeco = fiber.startDecoration;
          const endDeco = fiber.endDecoration;

          const startIcon = decorationIsIcon(startDeco) ? startDeco : null;
          const endIcon = decorationIsIcon(endDeco) ? endDeco : null;

          const iconSizeStart = startIcon?.size ?? 44;
          const iconSizeEnd = endIcon?.size ?? 44;

          const startIconTranslate = `translate(${fiber.startPoint.x - iconSizeStart / 2}, ${
            fiber.startPoint.y - iconSizeStart / 2
          })`;
          // To:
          const endIconTranslate = `translate(${fiber.endIconPoint.x - iconSizeEnd / 2}, ${
            fiber.endIconPoint.y - iconSizeEnd / 2
          })`;

          return (
            <g key={id}>
              {/* Base fiber */}
              <path
                d={d}
                stroke={color}
                strokeWidth={baseStrokeWidth}
                strokeLinecap="round"
                fill="none"
                opacity={baseOpacity}
                vectorEffect="non-scaling-stroke"
              />

              {/* Highlight fiber */}
              {enableHighlight && (
                <path
                  ref={(el) => {
                    highlightRefs.current[id] = el;
                  }}
                  d={d}
                  stroke={color}
                  strokeWidth={highlightStrokeWidth}
                  strokeLinecap="round"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    filter: `drop-shadow(0 0 ${blur1}px ${color}) drop-shadow(0 0 ${blur2}px ${color})`,
                  }}
                />
              )}

              {/* Start icon (dim) */}
              {startIcon && (
                <g
                  transform={startIconTranslate}
                  opacity={startIcon.dimOpacity ?? 0.33}
                >
                  <startIcon.Icon
                    size={iconSizeStart}
                    color={color}
                    strokeWidth={startIcon.strokeWidth ?? 2}
                  />
                </g>
              )}

              {/* End icon (dim) */}
              {endIcon && (
                <g
                  transform={endIconTranslate}
                  opacity={endIcon.dimOpacity ?? 0.33}
                >
                  <endIcon.Icon
                    size={iconSizeEnd}
                    color={color}
                    strokeWidth={endIcon.strokeWidth ?? 2}
                  />
                </g>
              )}

              {/* End icon glow (animated) */}
              {endIcon && enableHighlight && endIcon.glow !== false && (
                <g
                  ref={(el) => {
                    glowIconRefs.current[id] = el;
                  }}
                  transform={endIconTranslate}
                  style={{
                    filter: `drop-shadow(0 0 ${blur1 + 2}px ${color}) drop-shadow(0 0 ${blur2}px ${color})`,
                  }}
                >
                  <endIcon.Icon
                    size={iconSizeEnd}
                    color={color}
                    strokeWidth={endIcon.strokeWidth ?? 2}
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* HTML overlay buttons (optional endpoint decorations) */}
      <div className="pointer-events-none absolute inset-0">
        {geom.map((f) => {
          const startButton = decorationIsButton(f.startDecoration)
            ? f.startDecoration
            : null;
          const endButton = decorationIsButton(f.endDecoration)
            ? f.endDecoration
            : null;

          return (
            <React.Fragment key={f.id}>
              {startButton && (
                <button
                  type="button"
                  aria-label={startButton.ariaLabel}
                  className={startButton.className}
                  onClick={startButton.onClick}
                  style={{
                    position: "absolute",
                    left: f.startPoint.x,
                    top: f.startPoint.y,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                  }}
                >
                  {startButton.children}
                </button>
              )}
              {endButton && (
                <button
                  type="button"
                  aria-label={endButton.ariaLabel}
                  className={endButton.className}
                  onClick={endButton.onClick}
                  style={{
                    position: "absolute",
                    left: f.endPoint.x,
                    top: f.endPoint.y,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                  }}
                >
                  {endButton.children}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
