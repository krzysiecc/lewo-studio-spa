// components/ChatbotWindow.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

type ChatbotWindowProps = {
  onClose: () => void;
};

export default function ChatbotWindow({ onClose }: ChatbotWindowProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50 w-80 h-96 bg-seashell-200 rounded-lg shadow-2xl flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-coffee-900">
        <h3 className="font-bold text-coffee-900">W czym mogę Tobie pomóc?</h3>
        <button
          onClick={onClose}
          className="text-coffee-700 hover:text-coffee-700/60 transition-colors cursor-pointer"
        >
          &times; {/* A simple 'X' close icon */}
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-grow p-4 text-sm text-coffee-900">
        <p>
          Hej! Możesz spytać o cokolwiek - od mojego ulubionego koloru po moją
          dostępność dla naszego przyszłego spotkania.
        </p>

        {/* Chat messages would go here */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <input
          type="text"
          placeholder="Pisz tutaj..."
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bluepowder-500"
        />
      </div>
    </div>
  );
}
