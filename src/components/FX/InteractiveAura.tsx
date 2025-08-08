// components/InteractiveAuraMouseOnly.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const fragmentShader = `
	uniform float uTime;
	uniform vec2 uMouse;
	uniform vec3 uColor;
	varying vec2 vUv;

	float rand(vec2 co){
		return fract(sin(dot(co.xy ,vec2(9.9898,78.233))) * 43758.5453);
	}

	void main() {
		float grain = rand(vUv + 1.0);

		float dist = distance(vUv, uMouse);
		float aura = 1.0 - smoothstep(0.001, 1.0, dist); // aura falloff
		
		float brightness = 0.001 * (0.0 - smoothstep(0.0, 0.0, dist)); // small glow

		vec3 color = uColor + brightness;
		float alpha = grain * 0.2 * aura;

		gl_FragColor = vec4(color, alpha);
	}
`;

function MouseAuraGrain({ color }: { color: THREE.Color }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uColor: { value: color },
    }),
    [color]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    );
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// --- The main exportable component ---
type InteractiveAuraProps = {
  color?: string | THREE.Color; // Accept a string (e.g., '#ff0000') or a THREE.Color object
};

export default function InteractiveAura({
  color = "#ffffff",
}: InteractiveAuraProps) {
  // useMemo ensures we don't create a new THREE.Color object on every render
  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas>
        <MouseAuraGrain color={threeColor} />
      </Canvas>
    </div>
  );
}
