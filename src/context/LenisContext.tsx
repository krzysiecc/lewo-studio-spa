// src/context/LenisContextNew.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { createContext } from "react";
import Lenis from "@studio-freight/lenis";

export const LenisContext = createContext<React.RefObject<Lenis | null> | null>(
  null,
);
