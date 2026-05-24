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
    const bootTimer = setTimeout(() => setPhase("messages"), 1200);
    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    if (phase !== "messages") return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev >= MESSAGES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("exit"), 400);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "exit") {
      const timer = setTimeout(() => {
        setVisible(false);
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
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-vault-black"
      >
        {phase === "boot" && (
          <div className="text-center">
            <h1
              className="font-mono text-4xl font-bold tracking-[0.3em] text-vault-white md:text-6xl animate-flicker"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            >
              VULNVAULT
            </h1>
            <div className="mt-4 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-vault-gray-500 to-transparent" />
            <p className="mt-4 font-mono text-xs text-vault-gray-400 animate-pulse">
              DISCLOSURE WITHOUT EXPOSURE
            </p>
          </div>
        )}

        {phase === "messages" && (
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center px-4"
          >
            <p className="font-mono text-sm text-vault-gray-300 md:text-base tracking-wide">
              {`> ${MESSAGES[messageIndex]}`}
            </p>
          </motion.div>
        )}

        {phase === "exit" && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, scale: 1.1 }}
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
