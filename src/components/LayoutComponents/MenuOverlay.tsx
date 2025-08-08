// components/LayoutComponents/MenuOverlay.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSharedLenis } from "../../context/lenisContext";
import * as THREE from "three";
import gsap from "gsap";

// --- The Shader Material Component ---
function WaveCurtain({ isVisible }: { isVisible: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Animate the uProgress uniform with GSAP for a smooth rise/fall
  useEffect(() => {
    if (materialRef.current) {
      gsap.to(materialRef.current.uniforms.uProgress, {
        value: isVisible ? 1 : 0,
        duration: 0.8, // Control the speed of the wave rising/falling
        ease: "power1.in",
      });
    }
  }, [isVisible]);

  // Animate uTime for the wave's horizontal movement
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
        transparent={true}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 }, // 0 = down, 1 = up
          uColor: { value: new THREE.Color("#fdf2ea") },
        }}
      />
    </mesh>
  );
}

// --- The Main Overlay Component ---
const menuItems = [
  { label: "Work", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Studio", path: "/studio" },
  { label: "Contact", path: "/contact" },
];

export default function MenuOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // 👇 Get the entire ref object from the context
  const lenisRef = useSharedLenis();

  useEffect(() => {
    setIsVisible(true);

    const lenis = lenisRef.current;

    if (lenis) {
      lenis.stop();
    }

    return () => {
      const currentLenis = lenisRef.current;
      if (currentLenis) {
        console.log("✅ MenuOverlay: Unmounting. Starting scroll.");
        currentLenis.start();
      }
    };
  }, [lenisRef]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 1200);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <div
        className={`
        fixed inset-0 z-40 bg-seashell-100 h-auto
        transition-opacity duration-800
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
        onClick={handleClose}
      >
        {/* Layer 1: The WebGL Wave (now transparent background) */}
        <div className="absolute inset-0 pointer-events-none">
          <Canvas>
            {/* We'll update the WaveCurtain component next */}
            <WaveCurtain isVisible={isVisible} />
          </Canvas>
        </div>

        {/* Layer 2: The Navigation Links (foreground) */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {menuItems.map((item, index) => (
              <button
                key={item.path}
                // Stop the div's onClick from firing when a button is clicked
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(item.path);
                }}
                className={`
                pointer-events-auto font-antonio font-bold text-5xl md:text-7xl text-coffee-900/80
                tracking-wider transition-all duration-500
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }
              `}
                style={{
                  transitionDelay: isVisible ? `${500 + index * 100}ms` : "0ms", // No delay on exit
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

// --- Shaders (Place at the bottom of the file) ---

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // The base height of the wave, animated by uProgress
    // It moves from 1.0 (off-screen bottom) to -0.1 (fully on-screen top)
    float waveY = 1.0 - uProgress * 1.1;

    // --- The Magic: Multiple Sine Waves ---
    // Combine two sine waves with different frequencies and speeds for a more natural look
    float wave1 = sin(vUv.x * 10.0 + uTime * 0.8) * 0.03;
    float wave2 = sin(vUv.x * 15.0 + uTime * 0.5) * 0.04;
    
    // The final height of the wave at this pixel
    float finalWaveHeight = waveY + (wave1 + wave2) * uProgress;

    // Use step() to create a hard edge. If the pixel's y is below the wave height, alpha is 1.
    float alpha = step(vUv.y, finalWaveHeight);

    gl_FragColor = vec4(uColor, alpha);
  }
`;
