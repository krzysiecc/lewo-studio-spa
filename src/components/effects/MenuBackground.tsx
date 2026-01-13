// components/FX/MenuBackground.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { memo } from "react";
import Grain from "./Noise";

const MenuBackgroundComponent = () => {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <Grain />
    </div>
  );
};

export const MenuBackground = memo(MenuBackgroundComponent);
