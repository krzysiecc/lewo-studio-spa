// components/LayoutComponents/Chatbot.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useState } from "react";
import ChatbotWindow from "./ChatbotWindow"; // Assuming this exists

export default function Chatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <>
      <div className="relative group">
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-20 h-20 text-seashell-100 bg-coffee-900/80 rounded-3xl flex items-center justify-center shadow-2xl animate-breathing-glow cursor-pointer"
          >
            {/* ... svg icon ... */}
          </button>
        </div>
      </div>
      {isChatOpen && <ChatbotWindow onClose={() => setIsChatOpen(false)} />}
    </>
  );
}
