// components/FX/Grain.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// 👇 THE DEFINITIVE "BLINKING POINTS" SHADER
const fragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  // A high-quality hash function for generating random-looking values.
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.43));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    // --- 1. The Static "Points" Layer ---
    // This creates a static, non-moving field of potential points.
    // We scale vUv to make the points dense.
    float spatialNoise = hash(vUv * 7.0);

    // --- 2. The Dynamic "Blinking" Layer ---
    // This creates a second, slower-moving noise field that will act as our "blinker".
    // It determines WHICH of the static points are visible at any given moment.
    float temporalNoise = hash(vUv * 1.0 + uTime * 0.5);

    // --- 3. Combine them ---
    // We multiply the two noise fields together. A point is only visible
    // if it exists in BOTH the spatial and temporal noise patterns.
    float combinedNoise = spatialNoise * temporalNoise;

    // --- 4. Extreme Contrast for the "Points" look ---
    // This is the most crucial step. A very high power exponent crushes
    // almost all values to pure black, leaving only the brightest specks.
    float finalNoise = pow(combinedNoise, 20.0);

    // --- 5. Final Output: "White Dots on Black" ---
    // The RGB is pure white (1.0, 1.0, 1.0).
    // The ALPHA channel is our calculated noise. This means we are only drawing
    // the white specks onto the transparent canvas.
    gl_FragColor = vec4(0.6, 0.6, 0.6, finalNoise * uIntensity);
  }
`;

export default function Grain() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          // A very high intensity is needed to make the few surviving
          // specks from the pow() function brightly visible.
          uIntensity: { value: 1.0 },
        }}
        transparent={true}
      />
    </mesh>
  );
}
