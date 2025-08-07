// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

export default function Overlay() {
  return (
    <>
      {/* FRAME */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="w-full h-full border-[20px] border-white rounded-none bg-opacity-0 box-border pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-[20px] border-none pointer-events-none" />
        </div>
      </div>
      {/* HEADER */}
      <div className="layout-grid fixed top-[1rem] left-0 right-0 z-50">
        <div className="font-antonio font-light text-2xl px-10 py-10 col-start-1 col-span-1 text-seashell-50">
          logo
        </div>
        <div className="px-10 py-10 col-start-12 justify-self-end">
          <button
            aria-label="Menu"
            className="group relative w-8 h-6 flex items-center justify-center cursor-pointer z-50 transform transition-transform duration-500 hover:-rotate-90"
          >
            <div className="flex flex-col justify-between w-full h-full">
              {/* Line 1 */}
              <span className="block h-[2px] w-full bg-seashell-100 rounded transition-all duration-1200 group-hover:w-[200%] group-hover:-translate-x-3.5 group-hover:h-0.75" />
              {/* Line 2 */}
              <span className="block h-[2px] w-full bg-seashell-100 rounded transition-all duration-200 group-hover:w-[200%] group-hover:-translate-x-3.5 group-hover:h-0.75" />
              {/* Line 3 */}
              <span className="block h-[2px] w-full bg-seashell-100 rounded transition-all duration-700 group-hover:w-[200%] group-hover:-translate-x-3.5 group-hover:h-0.75" />
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
