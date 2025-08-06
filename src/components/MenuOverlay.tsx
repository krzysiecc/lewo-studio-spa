// components/MenuOverlay.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MenuOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-10 text-4xl text-seashell-100 font-bold text-center"
      >
        <button
          onClick={() => handleNavigate("/")}
          className="hover:scale-105 transition-transform duration-300"
        >
          Projects
        </button>
        <button
          onClick={() => handleNavigate("/about")}
          className="hover:scale-105 transition-transform duration-300"
        >
          About
        </button>
        <button
          onClick={() => handleNavigate("/contact")}
          className="hover:scale-105 transition-transform duration-300"
        >
          Contact
        </button>
      </div>
    </div>
  );
}
