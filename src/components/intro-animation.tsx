"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fast Snappy transition: duration matches the animation time
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 850);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: "-100%" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 left-0 right-0 z-50 bg-vault-black border-r border-vault-accent/30 pointer-events-none"
        style={{
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Glowing vertical stripe on the right edge that sweeps from right to left */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-[6px] bg-gradient-to-b from-vault-accent via-vault-cyan to-vault-accent"
          style={{
            boxShadow: "0 0 30px #bc9568, 0 0 10px #e2c99f",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

