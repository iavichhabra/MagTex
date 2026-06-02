"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"play" | "exit">("play");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Safety fallback: if video doesn't trigger onEnded within 8.5s, exit
    const fallbackTimer = setTimeout(() => {
      setPhase("exit");
    }, 8500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (phase === "exit") {
      const timer = setTimeout(() => {
        setVisible(false);
        // Remove the preloader-active class so main content becomes visible
        document.documentElement.classList.remove("preloader-active");
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {phase === "play" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16120e] overflow-hidden"
        >
          <video
            src="/magtex_promo.mp4"
            autoPlay
            muted
            playsInline
            onEnded={() => setPhase("exit")}
            className="w-full h-full object-contain max-w-7xl max-h-screen"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

