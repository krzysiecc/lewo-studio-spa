# Fibers System

A flexible React component system for creating animated SVG "fiber" connections between UI elements or anchor points.

## Features

- **Custom directions**: `leftToRight`, `rightToLeft`, `topToBottom`, `bottomToTop`, or `auto`
- **Multiple curve types**:
  - `trochoid`: Circular coil-like loops (calligraphic style)
  - `wave`: Smooth sine wave oscillations
- **Flexible endpoints**:
  - Connect to DOM elements (via refs or direct elements)
  - Connect to anchor points (percentage-based positioning)
  - Connect to absolute points
- **Optional endpoint decorations**:
  - SVG icons (with dim + glow layers)
  - HTML buttons
- **Per-fiber styling**: Color, stroke width, opacity, glow intensity
- **Per-fiber physics**: Segment count, smoothness, lead-in distance, amplitude, cycles, radius, etc.
- **Unlimited fibers**: Add as many as you want to a page
- **Smooth animations**: Dash-draw effect with GSAP on hover/active state

## Basic Usage

### 1. Using the Canvas Component Directly

```tsx
import { useRef } from "react";
import FibersCanvas from "./components/effects/FibersCanvas";
import { Home } from "lucide-react";

function MyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fibers = [
    {
      id: "fiber-1",
      start: {
        type: "element",
        element: buttonRef.current,
        attach: "right",
      },
      end: {
        type: "anchor",
        anchor: { xPct: 0.8, yPct: 0.5 },
      },
      style: {
        color: "#a2cf64",
        baseStrokeWidth: 2,
        highlightStrokeWidth: 3,
      },
      physics: {
        curve: "trochoid",
        direction: "rightToLeft",
      },
      endDecoration: {
        type: "icon",
        Icon: Home,
        size: 50,
      },
      isActive: true, // Controls dash-draw animation
    },
  ];

  return (
    <div ref={containerRef} className="relative h-screen">
      <FibersCanvas containerRef={containerRef} fibers={fibers} />

      <button ref={buttonRef}>Click me</button>
    </div>
  );
}
```

### 2. Using Helper Functions (Recommended)

```tsx
import { useRef, useState } from "react";
import FibersCanvas from "./components/effects/FibersCanvas";
import {
  fiberBetween,
  fiberToAnchor,
  createFiber,
} from "./components/effects/FiberHelpers";
import { Sparkles, Target } from "lucide-react";

function MyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxARef = useRef<HTMLDivElement>(null);
  const boxBRef = useRef<HTMLDivElement>(null);

  const [hoveredFiber, setHoveredFiber] = useState<string | null>(null);

  // Helper 1: Connect two elements
  const fiber1 = fiberBetween("a-to-b", boxARef, boxBRef, {
    color: "#96b4d2",
    curve: "wave",
    toIcon: Sparkles,
    isActive: hoveredFiber === "fiber1",
  });

  // Helper 2: Element to anchor point
  const fiber2 = fiberToAnchor(
    "b-to-corner",
    boxBRef,
    { xPct: 0.9, yPct: 0.1 },
    {
      color: "#e2608d",
      curve: "trochoid",
      radiusPx: 80,
      toIcon: Target,
      isActive: hoveredFiber === "fiber2",
    },
  );

  // Helper 3: Full control with createFiber
  const fiber3 = createFiber({
    id: "custom",
    from: { type: "ref", ref: boxARef, attach: "top" },
    to: { type: "anchor", xPct: 0.5, yPct: 0.1 },
    fromOffset: { x: 20, y: -10 },
    toOffset: { x: 0, y: 50 },
    color: "#eeae8d",
    curve: "wave",
    direction: "bottomToTop",
    amplitudePx: 60,
    cycles: 4,
    isActive: hoveredFiber === "fiber3",
  });

  const fibers = [fiber1, fiber2, fiber3];

  return (
    <div ref={containerRef} className="relative h-screen">
      <FibersCanvas containerRef={containerRef} fibers={fibers} />

      <div
        ref={boxARef}
        onMouseEnter={() => setHoveredFiber("fiber1")}
        onMouseLeave={() => setHoveredFiber(null)}
      >
        Box A
      </div>

      <div
        ref={boxBRef}
        onMouseEnter={() => setHoveredFiber("fiber2")}
        onMouseLeave={() => setHoveredFiber(null)}
      >
        Box B
      </div>
    </div>
  );
}
```

## API Reference

### FibersCanvas Props

| Prop               | Type                     | Description                                               |
| ------------------ | ------------------------ | --------------------------------------------------------- |
| `containerRef`     | `RefObject<HTMLElement>` | Ref to the container element (used for coordinate system) |
| `fibers`           | `FiberSpec[]`            | Array of fiber specifications                             |
| `className?`       | `string`                 | CSS class for the canvas wrapper                          |
| `enableHighlight?` | `boolean`                | Enable dash-draw animations (default: `true`)             |

### FiberSpec

```typescript
{
  id: string;
  start: FiberEndpointSource;
  end: FiberEndpointSource;
  startOffset?: Point;
  endOffset?: Point;
  style: FiberStyle;
  physics?: FiberPhysics;
  startDecoration?: FiberEndpointDecoration;
  endDecoration?: FiberEndpointDecoration;
  isActive?: boolean;
}
```

### FiberEndpointSource Types

**Point** (absolute coordinates):

```typescript
{ type: "point", point: { x: number, y: number } }
```

**Anchor** (percentage-based):

```typescript
{ type: "anchor", anchor: { xPct: number, yPct: number } }
```

**Element** (attach to DOM element):

```typescript
{
  type: "element",
  element: HTMLElement | null,
  attach?: "center" | "left" | "right" | "top" | "bottom"
}
```

### FiberStyle

```typescript
{
  color: string;
  baseStrokeWidth?: number;       // Default: 2
  baseOpacity?: number;           // Default: 0.16
  highlightStrokeWidth?: number;  // Default: 3
  highlightGlow?: {
    blur1?: number;               // Default: 10
    blur2?: number;               // Default: 22
  };
}
```

### FiberPhysics

```typescript
{
  direction?: "auto" | "leftToRight" | "rightToLeft" | "topToBottom" | "bottomToTop";
  curve?: "trochoid" | "wave";
  smoothness?: number;     // Catmull-Rom tension (0-2), default: 1.0
  segments?: number;       // Path resolution (8-300), default: 50
  leadInPx?: number;       // Clean lead-in distance, default: 120

  // Wave curve params
  amplitudePx?: number;    // Default: 34
  cycles?: number;         // Default: 2.5

  // Trochoid curve params
  radiusPx?: number;       // Default: 60
  curlAspect?: number;     // X scaling (0-1), default: 0.6
  curlReverse?: boolean;   // Curl direction, default: true

  seed?: number;           // Random seed for variation
}
```

### FiberEndpointDecoration

**None**:

```typescript
{
  type: "none";
}
```

**Icon**:

```typescript
{
  type: "icon",
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>,
  size?: number,
  dimOpacity?: number,
  glow?: boolean,
  strokeWidth?: number
}
```

**Button**:

```typescript
{
  type: "button",
  ariaLabel: string,
  className?: string,
  onClick?: () => void,
  children?: React.ReactNode
}
```

## Helper Functions

### `createFiber(config: FiberBuilderConfig): FiberSpec`

Create a fiber with simplified config (all optional except `id`).

### `fiberBetween(id, fromRef, toRef, options?): FiberSpec`

Connect two elements by refs.

### `fiberToAnchor(id, fromRef, toAnchor, options?): FiberSpec`

Connect an element to an anchor point.

### `fiberFromAnchor(id, fromAnchor, toRef, options?): FiberSpec`

Connect an anchor point to an element.

### `createFibers(defaults, fibers[]): FiberSpec[]`

Batch-create multiple fibers with shared defaults.

```typescript
const fibers = createFibers(
  { color: "#a2cf64", curve: "wave" },
  [
    { id: "f1", from: {...}, to: {...} },
    { id: "f2", from: {...}, to: {...} },
  ]
);
```

## Examples

See `src/pages/FiberExamplePage.tsx` for a complete working example with interactive hover states.

## Performance Notes

- Fibers are responsive and recalculate on container resize
- Hidden on mobile (<1024px width) in MenuOverlay (configurable per usage)
- SVG paths are memoized and only regenerate when endpoints/config change
- GSAP handles animations efficiently
- Use `enableHighlight={false}` if you don't need animations

## Architecture

- **FibersCanvas.tsx**: Main component, handles rendering and animations
- **FiberHelpers.tsx**: Ergonomic builder functions
- **MenuOverlay.tsx**: Example integration (menu navigation fibers)
- **FiberExamplePage.tsx**: Standalone demo page
