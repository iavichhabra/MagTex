"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant luxurious transition: duration matches the animation time
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1100);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: "-100%" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-y-0 left-0 right-0 z-50 bg-vault-black pointer-events-none"
        style={{
          boxShadow: "15px 0 50px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Soft trailing atmospheric glow extending to the right */}
        <div 
          className="absolute top-0 bottom-0 left-full w-[250px] bg-gradient-to-r from-vault-accent/25 via-vault-accent/5 to-transparent pointer-events-none blur-lg"
        />

        {/* Glowing vertical stripe on the right edge that sweeps from right to left */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-[8px] bg-gradient-to-b from-vault-accent via-vault-cyan to-vault-accent"
          style={{
            boxShadow: "0 0 40px #bc9568, 0 0 15px #e2c99f",
          }}
        />

        {/* Soft internal edge light to blend the stripe with the black background */}
        <div className="absolute top-0 bottom-0 right-[8px] w-[1px] bg-vault-white/10" />
      </motion.div>
    </AnimatePresence>
  );
}

