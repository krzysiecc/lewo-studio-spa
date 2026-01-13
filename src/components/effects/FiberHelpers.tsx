// Helper utilities for creating FibersCanvas fiber specs
import type { ComponentType } from "react";
import type {
  FiberSpec,
  FiberEndpointSource,
  FiberEndpointDecoration,
  FiberStyle,
  FiberPhysics,
  Point,
} from "./FibersCanvas";

export interface FiberBuilderConfig {
  id: string;

  // Endpoints
  from?:
    | { type: "point"; point: Point }
    | { type: "anchor"; xPct: number; yPct: number }
    | {
        type: "element";
        element: HTMLElement | null;
        attach?: "center" | "left" | "right" | "top" | "bottom";
      }
    | {
        type: "ref";
        ref: React.RefObject<HTMLElement>;
        attach?: "center" | "left" | "right" | "top" | "bottom";
      };

  to?:
    | { type: "point"; point: Point }
    | { type: "anchor"; xPct: number; yPct: number }
    | {
        type: "element";
        element: HTMLElement | null;
        attach?: "center" | "left" | "right" | "top" | "bottom";
      }
    | {
        type: "ref";
        ref: React.RefObject<HTMLElement>;
        attach?: "center" | "left" | "right" | "top" | "bottom";
      };

  // Offsets
  fromOffset?: Point;
  toOffset?: Point;

  // Style
  color?: string;
  baseStrokeWidth?: number;
  baseOpacity?: number;
  highlightStrokeWidth?: number;
  highlightGlow?: { blur1?: number; blur2?: number };

  // Physics
  curve?: "trochoid" | "wave";
  direction?:
    | "auto"
    | "leftToRight"
    | "rightToLeft"
    | "topToBottom"
    | "bottomToTop";
  smoothness?: number;
  segments?: number;
  leadInPx?: number;
  amplitudePx?: number;
  cycles?: number;
  radiusPx?: number;
  curlAspect?: number;
  curlReverse?: boolean;
  seed?: number;

  // Endpoint decorations
  fromIcon?: ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  fromIconSize?: number;
  fromIconDimOpacity?: number;
  fromIconGlow?: boolean;
  fromIconStrokeWidth?: number;

  toIcon?: ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  toIconSize?: number;
  toIconDimOpacity?: number;
  toIconGlow?: boolean;
  toIconStrokeWidth?: number;

  fromButton?: {
    ariaLabel: string;
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  };

  toButton?: {
    ariaLabel: string;
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  };

  // Active state
  isActive?: boolean;
}

function resolveEndpointSource(
  endpoint?: FiberBuilderConfig["from"] | FiberBuilderConfig["to"]
): FiberEndpointSource {
  if (!endpoint || endpoint.type === "point") {
    return { type: "point", point: endpoint?.point ?? { x: 0, y: 0 } };
  }

  if (endpoint.type === "anchor") {
    return {
      type: "anchor",
      anchor: { xPct: endpoint.xPct, yPct: endpoint.yPct },
    };
  }

  if (endpoint.type === "ref") {
    return {
      type: "element",
      element: endpoint.ref.current,
      attach: endpoint.attach,
    };
  }

  // type === "element"
  return {
    type: "element",
    element: endpoint.element,
    attach: endpoint.attach,
  };
}

function resolveDecoration(config: {
  icon?: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconSize?: number;
  iconDimOpacity?: number;
  iconGlow?: boolean;
  iconStrokeWidth?: number;
  button?: {
    ariaLabel: string;
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  };
}): FiberEndpointDecoration {
  const { icon, iconSize, iconDimOpacity, iconGlow, iconStrokeWidth, button } =
    config;

  if (button) {
    return {
      type: "button",
      ariaLabel: button.ariaLabel,
      className: button.className,
      onClick: button.onClick,
      children: button.children,
    };
  }

  if (icon) {
    return {
      type: "icon",
      Icon: icon,
      size: iconSize,
      dimOpacity: iconDimOpacity,
      glow: iconGlow,
      strokeWidth: iconStrokeWidth,
    };
  }

  return { type: "none" };
}

/**
 * Create a fiber specification from a simplified config.
 *
 * @example
 * ```tsx
 * const fiber = createFiber({
 *   id: "hero-to-cta",
 *   from: { type: "ref", ref: heroRef, attach: "right" },
 *   to: { type: "anchor", xPct: 0.8, yPct: 0.5 },
 *   color: "#ff6b9d",
 *   curve: "trochoid",
 *   toIcon: Sparkles,
 *   isActive: true,
 * });
 * ```
 */
export function createFiber(config: FiberBuilderConfig): FiberSpec {
  const {
    id,
    from,
    to,
    fromOffset,
    toOffset,
    color = "#ffffff",
    baseStrokeWidth = 2,
    baseOpacity = 0.5,
    highlightStrokeWidth = 3,
    highlightGlow,
    curve = "trochoid",
    direction = "auto",
    smoothness = 1.0,
    segments = 50,
    leadInPx = 120,
    amplitudePx = 34,
    cycles = 2.5,
    radiusPx = 60,
    curlAspect = 0.6,
    curlReverse = true,
    seed = 20260112,
    fromIcon,
    fromIconSize,
    fromIconDimOpacity,
    fromIconGlow,
    fromIconStrokeWidth,
    toIcon,
    toIconSize,
    toIconDimOpacity,
    toIconGlow,
    toIconStrokeWidth,
    fromButton,
    toButton,
    isActive = false,
  } = config;

  const style: FiberStyle = {
    color,
    baseStrokeWidth,
    baseOpacity,
    highlightStrokeWidth,
    highlightGlow,
  };

  const physics: FiberPhysics = {
    curve,
    direction,
    smoothness,
    segments,
    leadInPx,
    amplitudePx,
    cycles,
    radiusPx,
    curlAspect,
    curlReverse,
    seed,
  };

  const startDecoration = resolveDecoration({
    icon: fromIcon,
    iconSize: fromIconSize,
    iconDimOpacity: fromIconDimOpacity,
    iconGlow: fromIconGlow,
    iconStrokeWidth: fromIconStrokeWidth,
    button: fromButton,
  });

  const endDecoration = resolveDecoration({
    icon: toIcon,
    iconSize: toIconSize,
    iconDimOpacity: toIconDimOpacity,
    iconGlow: toIconGlow,
    iconStrokeWidth: toIconStrokeWidth,
    button: toButton,
  });

  return {
    id,
    start: resolveEndpointSource(from),
    end: resolveEndpointSource(to),
    startOffset: fromOffset,
    endOffset: toOffset,
    style,
    physics,
    startDecoration,
    endDecoration,
    isActive,
  };
}

/**
 * Create multiple fibers at once with shared defaults.
 *
 * @example
 * ```tsx
 * const fibers = createFibers(
 *   {
 *     color: "#a2cf64",
 *     curve: "wave",
 *     highlightStrokeWidth: 4,
 *   },
 *   [
 *     { id: "fiber-1", from: { type: "anchor", xPct: 0.2, yPct: 0.3 }, to: { type: "anchor", xPct: 0.8, yPct: 0.7 } },
 *     { id: "fiber-2", from: { type: "anchor", xPct: 0.3, yPct: 0.6 }, to: { type: "anchor", xPct: 0.7, yPct: 0.4 } },
 *   ]
 * );
 * ```
 */
export function createFibers(
  defaults: Partial<Omit<FiberBuilderConfig, "id">>,
  fibers: FiberBuilderConfig[]
): FiberSpec[] {
  return fibers.map((fiber) => createFiber({ ...defaults, ...fiber }));
}

/**
 * Create a simple fiber from element to element.
 *
 * @example
 * ```tsx
 * const fiber = fiberBetween("nav-to-hero", navRef, heroRef, {
 *   color: "#96b4d2",
 *   toIcon: ChevronRight,
 * });
 * ```
 */
export function fiberBetween(
  id: string,
  from: React.RefObject<HTMLElement>,
  to: React.RefObject<HTMLElement>,
  options: Partial<Omit<FiberBuilderConfig, "id" | "from" | "to">> = {}
): FiberSpec {
  return createFiber({
    id,
    from: { type: "ref", ref: from },
    to: { type: "ref", ref: to },
    ...options,
  });
}

/**
 * Create a fiber from an element to an anchor point.
 *
 * @example
 * ```tsx
 * const fiber = fiberToAnchor("cta-to-corner", ctaRef, { xPct: 0.9, yPct: 0.1 }, {
 *   color: "#eeae8d",
 *   curve: "wave",
 * });
 * ```
 */
export function fiberToAnchor(
  id: string,
  from: React.RefObject<HTMLElement>,
  toAnchor: { xPct: number; yPct: number },
  options: Partial<Omit<FiberBuilderConfig, "id" | "from" | "to">> = {}
): FiberSpec {
  return createFiber({
    id,
    from: { type: "ref", ref: from },
    to: { type: "anchor", ...toAnchor },
    ...options,
  });
}

/**
 * Create a fiber from an anchor point to an element.
 *
 * @example
 * ```tsx
 * const fiber = fiberFromAnchor("corner-to-button", { xPct: 0.1, yPct: 0.9 }, buttonRef, {
 *   color: "#e2608d",
 *   toIcon: Target,
 * });
 * ```
 */
export function fiberFromAnchor(
  id: string,
  fromAnchor: { xPct: number; yPct: number },
  to: React.RefObject<HTMLElement>,
  options: Partial<Omit<FiberBuilderConfig, "id" | "from" | "to">> = {}
): FiberSpec {
  return createFiber({
    id,
    from: { type: "anchor", ...fromAnchor },
    to: { type: "ref", ref: to },
    ...options,
  });
}
