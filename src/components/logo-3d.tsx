"use client";

import React from "react";
import { motion } from "framer-motion";

export function Logo3D({ className = "" }: { className?: string }) {
  // We render multiple layers of the SVG to build 3D extrusion thickness
  const layers = Array.from({ length: 18 });

  // Paths defined in SVG viewBox 0 0 100 100
  // Square A (bottom-left)
  const pathA = 
    "M 10,35 L 75,35 L 75,100 L 10,100 Z M 23,48 L 23,87 L 62,87 L 62,67 L 67,67 L 67,62 L 62,62 L 62,48 L 38,48 L 38,43 L 33,43 L 33,48 L 23,48 Z";
  
  // Square B (top-right)
  const pathB = 
    "M 25,10 L 90,10 L 90,75 L 25,75 Z M 38,23 L 38,43 L 33,43 L 33,48 L 38,48 L 38,62 L 62,62 L 62,67 L 67,67 L 67,62 L 77,62 L 77,23 Z";
  
  // Interlocking overlay segment (covers bottom-right overlap of A over B)
  const pathOverlap = 
    "M 62,50 L 75,50 L 75,100 L 50,100 L 50,87 L 62,87 L 62,67 L 67,67 L 67,62 L 62,62 Z";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ perspective: 1200 }}>
      {/* 3D Scene Wrapper */}
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: [0, 15, -15, 0],
          rotateX: [12, -12, 12, 12],
          rotateZ: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="relative w-48 h-48 md:w-56 md:h-56"
      >
        {/* Render Extrusion Layers */}
        {layers.map((_, i) => {
          const isFace = i === layers.length - 1;
          const zOffset = i * 0.75; // translateZ offset

          return (
            <div
              key={i}
              className="absolute inset-0 select-none pointer-events-none"
              style={{
                transform: `translate3d(0, 0, ${zOffset}px)`,
                transformStyle: "preserve-3d",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                fillRule="evenodd"
                style={{
                  filter: isFace ? "url(#chrome-glow)" : "none",
                }}
              >
                <defs>
                  {/* Linear gradient for metallic faces */}
                  <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="20%" stopColor="#f3f4f6" />
                    <stop offset="40%" stopColor="#9ca3af" />
                    <stop offset="50%" stopColor="#374151" />
                    <stop offset="60%" stopColor="#1f2937" />
                    <stop offset="70%" stopColor="#9ca3af" />
                    <stop offset="85%" stopColor="#f3f4f6" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>

                  {/* Linear gradient for darker extruded sides */}
                  <linearGradient id="side-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4b5563" />
                    <stop offset="50%" stopColor="#1f2937" />
                    <stop offset="100%" stopColor="#111827" />
                  </linearGradient>

                  {/* Glow filter for the face layer */}
                  <filter id="chrome-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.5" result="blur" />
                    <feComponentTransfer in="blur" result="glow">
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Left-Down Square (A) */}
                <path
                  d={pathA}
                  fill={isFace ? "url(#chrome-grad)" : "url(#side-grad)"}
                  stroke={isFace ? "#ffffff" : "#1f2937"}
                  strokeWidth={isFace ? "0.6" : "0"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Right-Up Square (B) */}
                <path
                  d={pathB}
                  fill={isFace ? "url(#chrome-grad)" : "url(#side-grad)"}
                  stroke={isFace ? "#ffffff" : "#1f2937"}
                  strokeWidth={isFace ? "0.6" : "0"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interlocking Segment (A on top of B) */}
                <path
                  d={pathOverlap}
                  fill={isFace ? "url(#chrome-grad)" : "url(#side-grad)"}
                  stroke={isFace ? "#ffffff" : "#1f2937"}
                  strokeWidth={isFace ? "0.6" : "0"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
