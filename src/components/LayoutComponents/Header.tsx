// components/Header.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useState } from "react";

import MenuOverlay from "./MenuOverlay";

import MixerButton from "./MixerButton";
import LogoMain from "../Logos/LogoMain";
import LogoMainSecure from "../Logos/LogoMainSecure";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 w-full z-50 p-4 md:p-6 flex justify-between items-right">
        <LogoMainSecure className="ml-2 w-20 h-auto fill-coffee-900/80 pointer-events-auto hover:fill-coffee-900/100 transition-all ease-in-out" />

        <MixerButton isOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
      </header>

      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
    </>
  );
}
