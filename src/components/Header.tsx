// components/Header.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useEffect, useRef, useState } from "react";

export default function Header() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const headerHeight = headerRef.current?.offsetHeight || 20;

      setShow(currentY <= headerHeight - 10 || currentY < lastScrollY);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      ref={headerRef}
      className={`layout-grid fixed top-[1rem] left-0 right-0 z-50 backdrop-blur-lg bg-seashell-100/70
 transition-transform duration-300 ${
   show ? "translate-y-0" : "-translate-y-[calc(100%+1rem)]"
 }`}
    >
      <div className="px-10 py-10 col-start-12 justify-self-end">
        <button
          aria-label="Menu"
          className="group relative w-8 h-6 flex items-center justify-center cursor-pointer z-50
               transform transition-transform duration-500 hover:-rotate-90"
          onClick={() => {
            console.log("todo: open menu");
          }}
        >
          <div className="flex flex-col justify-between w-full h-full">
            {/* Line 1 */}
            <span className="block h-[2px] w-full bg-coffee-900 rounded transform transition-all duration-200 group-hover:w-[200%] group-hover:-translate-x-4.5 group-hover:h-0.75" />

            {/* Line 2 */}
            <span className="block h-[2px] w-full bg-coffee-900 rounded transform transition-all duration-800 group-hover:w-[200%] group-hover:-translate-x-4.5 group-hover:h-0.75" />

            {/* Line 3 */}
            <span className="block h-[2px] w-full bg-coffee-900 rounded transform transition-all duration-1200 group-hover:w-[200%] group-hover:-translate-x-4.5 group-hover:h-0.75" />
          </div>
        </button>
      </div>
    </div>
  );
}
