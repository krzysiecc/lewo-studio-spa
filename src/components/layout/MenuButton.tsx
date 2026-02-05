// components/layout/MixerButton.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      onClick={onClick}
      className="relative z-50 flex items-center justify-center w-20 h-20 text-coffee-900/80 group"
    >
      <div className="relative w-5 md:w-10 h-10 md:h-13 flex justify-between">
        {/* Left Line */}
        <div className="relative w-[3px] md:w-[4px] h-full bg-current">
          <span
            className={`
              absolute left-1/2 block w-1 md:w-2 h-1 md:h-2 -translate-x-1/2 rounded-full border-2 border-current bg-coffee-900
              transition-all duration-500 ease-in-out
              ${isOpen ? "top-1/4" : "top-3/4 group-hover:top-1/2"}
            `}
          />
        </div>

        {/* Middle Line */}
        <div className="relative w-[3px] md:w-[4px] h-full bg-current/30"></div>

        {/* Right Line */}
        <div className="relative w-[3px] md:w-[4px] h-full bg-current">
          <span
            className={`
              absolute left-1/2 block w-1 md:w-2 h-1 md:h-2 -translate-x-1/2 rounded-full border-2 border-current bg-coffee-900
              transition-all duration-500 ease-in-out
              ${isOpen ? "top-3/4" : "top-1/4 group-hover:top-1/2"}
            `}
          />
        </div>
      </div>
    </button>
  );
}
