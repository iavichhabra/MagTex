"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = "MAGTEX".split("");

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "tagline" | "exit">("logo");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Logo shows for 1s, then tagline for 0.6s, then exit
    const taglineTimer = setTimeout(() => setPhase("tagline"), 900);
    const exitTimer = setTimeout(() => setPhase("exit"), 1600);
    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (phase === "exit") {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-vault-black"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-vault-accent/10 rounded-full blur-[120px] animate-pulse" />

        {/* Staggered letter reveal */}
        <div className="relative flex items-center gap-1 md:gap-2">
          {LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.15em] text-vault-white"
              style={{ textShadow: "0 0 40px rgba(188, 149, 104, 0.3)" }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 h-[2px] w-48 md:w-64 bg-gradient-to-r from-transparent via-vault-accent to-transparent origin-center"
        />

        {/* Tagline */}
        <AnimatePresence>
          {(phase === "tagline" || phase === "exit") && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 font-mono text-xs md:text-sm font-medium tracking-[0.3em] text-vault-accent uppercase"
            >
              Disclosure Without Exposure
            </motion.p>
          )}
        </AnimatePresence>

        {/* Exit fade */}
        {phase === "exit" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-vault-black"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
