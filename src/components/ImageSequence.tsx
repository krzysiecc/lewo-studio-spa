// src/components/ImageSequence.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceProps {
  folderPath: string;
  fileNamePrefix: string;
  frameCount?: number;
  extension?: string;
  digits?: number;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement>;
}

const ImageSequence: React.FC<ImageSequenceProps> = ({
  folderPath,
  fileNamePrefix,
  frameCount = 60,
  extension = ".webp",
  digits = 4,
  className = "",
  triggerRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We use refs for data that doesn't need to trigger re-renders
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameInfo = useRef({ frame: 0 });

  const getFrameUrl = (index: number) => {
    const frameNumber = (index + 1).toString().padStart(digits, "0");
    // Ensure no double slashes if folderPath ends with /
    const cleanFolder = folderPath.replace(/\/$/, "");
    return `${cleanFolder}/${fileNamePrefix}${frameNumber}${extension}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!context) return;

    canvas.width = 1080;
    canvas.height = 1080;

    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    // --- PRELOAD LOGIC ---
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const url = getFrameUrl(i);
      img.src = url;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImagesLoaded(true);
          renderFrame(0);
        }
      };

      img.onerror = () => {
        // Log the exact path that failed so you can fix it
        if (i === 0) {
          console.error(`❌ IMAGE LOAD FAILED. Checked path: ${url}`);
          setError(`Failed to load images. Check console for path: ${url}`);
        }
        // Mark as loaded anyway so the app doesn't freeze,
        // but the renderFrame function will skip it.
        loadedCount++;
        if (loadedCount === frameCount) setImagesLoaded(true);
      };

      imgs.push(img);
    }
    imagesRef.current = imgs;

    // --- RENDER LOGIC (FIXED) ---
    const renderFrame = (index: number) => {
      const img = imagesRef.current[index];

      // SAFETY CHECK: Only draw if image is fully loaded and valid
      // 'naturalWidth' is 0 if the image is broken/failed
      if (img && img.complete && img.naturalWidth > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    // --- GSAP LOGIC ---
    const ctx = gsap.context(() => {
      gsap.to(frameInfo.current, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef?.current ?? containerRef.current,
          start: triggerRef ? "top top" : "top center",
          end: "bottom bottom",
          scrub: 0,
        },
        onUpdate: () => {
          renderFrame(Math.round(frameInfo.current.frame));
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [folderPath, fileNamePrefix, frameCount, extension, digits, triggerRef]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold bg-white/80 z-20 p-4 text-center">
          {error}
        </div>
      )}

      {!imagesLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-mono text-sm">
          LOADING...
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain will-change-contents"
      />
    </div>
  );
};

export default ImageSequence;
