"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Disclosure Without Exposure",
  "Your vulnerabilities belong to you.",
  "Private by default.",
  "Sensitive research deserves private markets.",
  "Built for security researchers.",
];

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"boot" | "messages" | "exit">("boot");
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Ultra-fast boot phase
    const bootTimer = setTimeout(() => setPhase("messages"), 500);
    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    if (phase !== "messages") return;
    // Fast snappy typing/terminal message sweep
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= MESSAGES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("exit"), 100);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "exit") {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 200);
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
        {phase === "boot" && (
          <div className="text-center px-6">
            <h1
              className="font-mono text-5xl font-black tracking-[0.35em] text-vault-white md:text-7xl lg:text-8xl animate-flicker"
              style={{ textShadow: "0 0 30px rgba(188, 149, 104, 0.25)" }}
            >
              VULNVAULT
            </h1>
            <div className="mt-6 h-[2px] w-64 md:w-96 mx-auto bg-gradient-to-r from-transparent via-vault-accent to-transparent" />
            <p className="mt-6 font-mono text-sm font-bold tracking-[0.25em] text-vault-accent animate-pulse md:text-base lg:text-lg">
              DISCLOSURE WITHOUT EXPOSURE
            </p>
          </div>
        )}

        {phase === "messages" && (
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="text-center px-6 max-w-5xl"
          >
            <p className="font-mono text-2xl font-bold text-vault-accent md:text-4xl lg:text-5xl leading-tight tracking-wide">
              {`> ${MESSAGES[messageIndex]}`}
            </p>
          </motion.div>
        )}

        {phase === "exit" && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-vault-black"
          />
        )}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 animate-scanline opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px]" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
