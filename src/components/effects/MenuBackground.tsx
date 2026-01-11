// components/FX/MenuBackground.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import Grain from "./Grain";
import ShadowyClouds from "./ShadowyClouds";
// Import the bridge from the new file
import { fxBridge } from "../../utils/fxBridge";

interface MenuBackgroundProps {
  defaultCloudColor: string;
  cloudScale?: number;
  cloudSpeed?: number;
  cloudContrast?: number;
}

const MenuBackgroundComponent = ({
  defaultCloudColor,
  cloudScale,
  cloudSpeed,
  cloudContrast,
}: MenuBackgroundProps) => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <ShadowyClouds
          bridge={fxBridge}
          defaultColor={defaultCloudColor}
          scale={cloudScale}
          speed={cloudSpeed}
          contrast={cloudContrast}
        />
        <Grain />
      </Canvas>
    </div>
  );
};

export const MenuBackground = memo(MenuBackgroundComponent);
