"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo3D } from "./logo-3d";

const LETTERS = "MAGTEX".split("");

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "text" | "tagline" | "exit">("logo");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Logo enters immediately.
    // Letters start revealing at 700ms.
    // Tagline fades in at 1500ms.
    // Preloader begins exit fade at 2400ms.
    const textTimer = setTimeout(() => setPhase("text"), 700);
    const taglineTimer = setTimeout(() => setPhase("tagline"), 1500);
    const exitTimer = setTimeout(() => setPhase("exit"), 2400);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (phase === "exit") {
      const timer = setTimeout(() => {
        setVisible(false);
        // Remove the preloader-active class so main content becomes visible
        document.documentElement.classList.remove("preloader-active");
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-vault-black overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vault-accent/5 rounded-full blur-[140px] animate-pulse" />

        <div className="flex flex-col items-center gap-8 md:gap-10 relative z-10">
          {/* 3D Interlocking Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 30, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1.0, y: 0, rotateY: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Logo3D className="w-40 h-40 md:w-48 md:h-48" />
          </motion.div>

          {/* Staggered letter reveal */}
          {(phase === "text" || phase === "tagline" || phase === "exit") && (
            <div className="relative flex items-center gap-1 md:gap-2">
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-[0.15em] text-vault-white"
                  style={{ textShadow: "0 0 40px rgba(188, 149, 104, 0.25)" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          )}

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-[1.5px] w-40 md:w-56 bg-gradient-to-r from-transparent via-vault-accent/60 to-transparent origin-center"
          />

          {/* Tagline */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence>
              {(phase === "tagline" || phase === "exit") && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="font-mono text-[10px] md:text-xs font-semibold tracking-[0.3em] text-vault-accent uppercase"
                >
                  Disclosure Without Exposure
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Exit fade overlay */}
        {phase === "exit" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-vault-black pointer-events-none"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

