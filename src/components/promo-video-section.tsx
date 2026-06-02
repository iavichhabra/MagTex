"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export function PromoVideoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-vault-black py-20 md:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2rem] overflow-hidden aspect-[4/5] sm:aspect-[4/3] md:aspect-video border border-vault-gray-800/50 shadow-2xl shadow-vault-accent/5"
        >
          {/* Video Element */}
          <video 
            src="/magtex_promo.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-vault-black/90 via-vault-black/40 to-transparent pointer-events-none" />

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vault-gray-900/80 backdrop-blur-md border border-vault-gray-700/50 mb-3 sm:mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-vault-accent" />
                </span>
                <span className="text-xs font-mono text-vault-accent uppercase tracking-widest">
                  Cinematic Preview
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-vault-white mb-2 sm:mb-3">
                Disclosure Without Exposure
              </h2>
              <p className="text-vault-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Experience the first sovereign vulnerability marketplace powered by Story Protocol CDR. 
                AES-256 encrypted, programmable, and entirely confidential.
              </p>
            </div>
            
            <Link href="/submit" className="w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto bg-vault-accent text-vault-black font-bold px-8 py-3.5 rounded-full hover:bg-vault-accent/90 transition-colors shadow-[0_0_20px_rgba(188,149,104,0.3)] text-center"
              >
                Enter the Vault
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
