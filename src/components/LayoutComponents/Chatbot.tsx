// components/LayoutComponents/Chatbot.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useState } from "react";
import ChatbotWindow from "./ChatbotWindow";

export default function Chatbot({ isMenuOpen }: { isMenuOpen: boolean }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <>
      <div
        className={`
          fixed bottom-8 left-8 z-40 pointer-events-auto
          transition-all duration-500 ease-in-out
          ${
            isMenuOpen
              ? "opacity-0 -translate-x-16 pointer-events-none"
              : "opacity-100 translate-x-0"
          }
        `}
      >
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 bg-avocado-200 rounded-full flex items-center justify-center shadow-lg animate-breathing-glow"
        >
          icon
        </button>
      </div>
      {isChatOpen && <ChatbotWindow onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
