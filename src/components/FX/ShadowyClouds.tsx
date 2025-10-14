// components/FX/ShadowyClouds.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const cloudFragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;

	 // 👇 Our new "control panel" uniforms
  uniform float uScale;
  uniform float uSpeed;
  uniform float uContrast;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

   // A simple hash function to generate our dithering noise
  float random(vec2 p) { 
    return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // 👇 Use the uniforms instead of "magic numbers"
    float noise = snoise((vUv + uTime * uSpeed) * uScale);
    noise = (noise + 1.0) / 2.0;
    noise = pow(noise, uContrast);
    
    // The dithering logic for antialiasing is perfect and stays
    float dither = random(gl_FragCoord.xy) * (1.0 / 255.0);
    float finalAlpha = (noise * uOpacity) + dither;
    
    gl_FragColor = vec4(uColor, finalAlpha);
  }
`;

type ShadowyCloudsProps = {
  bridge: {
    update: (isHovered: boolean, color: string) => void;
  };
  defaultColor: string;
  scale?: number;
  speed?: number;
  contrast?: number;
};

export default function ShadowyClouds({
  bridge,
  defaultColor,
  scale = 0.6,
  speed = 0.02,
  contrast = 2.5,
}: ShadowyCloudsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    // The self-initializing animation is PERFECT.
    if (!materialRef.current) return;
    gsap.to(materialRef.current.uniforms.uOpacity, {
      value: 0.15,
      duration: 1.2,
      delay: 0.5,
      ease: "power2.out",
    });

    // The bridge listener is where we make the final fix.
    bridge.update = (isHovered, color) => {
      if (!materialRef.current) return;

      // --- 👇 THIS IS THE DEFINITIVE FIX ---
      // Immediately kill any active animations on these specific properties
      // before starting new ones. This prevents all race conditions.
      gsap.killTweensOf(materialRef.current.uniforms.uOpacity);
      gsap.killTweensOf(materialRef.current.uniforms.uColor.value);

      // Now, we can safely create the new animations.
      // If hovered, animate in.
      if (isHovered) {
        gsap.to(materialRef.current.uniforms.uOpacity, {
          value: 0.4,
          duration: 1.0,
          ease: "power2.inOut",
        });
        gsap.to(materialRef.current.uniforms.uColor.value, {
          r: new THREE.Color(color).r,
          g: new THREE.Color(color).g,
          b: new THREE.Color(color).b,
          duration: 0.7,
          ease: "power2.out",
        });
      } else {
        // If NOT hovered, animate out quickly.
        gsap.to(materialRef.current.uniforms.uOpacity, {
          value: 0.15,
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(materialRef.current.uniforms.uColor.value, {
          r: new THREE.Color(color).r, // `color` will be the defaultHexColor
          g: new THREE.Color(color).g,
          b: new THREE.Color(color).b,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };
  }, [bridge, defaultColor]);

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
        vertexShader={cloudVertexShader}
        fragmentShader={cloudFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uColor: { value: new THREE.Color(defaultColor) },
          uScale: { value: scale },
          uSpeed: { value: speed },
          uContrast: { value: contrast },
        }}
        transparent={true}
      />
    </mesh>
  );
}
