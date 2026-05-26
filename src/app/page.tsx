"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Eye, ChevronRight } from "lucide-react";
import { IntroAnimation } from "@/components/intro-animation";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-20 bg-vault-black dot-grid opacity-25" />
        <div className="absolute inset-0 -z-10 scanline-overlay opacity-30" />
        <div className="absolute -top-[300px] left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-vault-accent/5 opacity-60 blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 py-32 md:py-48 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-block mb-8 rounded-full border border-vault-gray-800 bg-vault-gray-950/40 px-5 py-2 backdrop-blur-md">
              <span className="font-mono text-sm font-semibold text-vault-gray-400 flex items-center gap-2.5 tracking-widest">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-vault-accent"></span>
                </span>
                STORY PROTOCOL CDR ACTIVE
              </span>
            </div>
            
            <h1 className="font-mono text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl leading-tight text-vault-white">
              DISCLOSURE
              <br />
              WITHOUT <span className="text-gradient">EXPOSURE</span>
            </h1>
            
            <p className="mx-auto mt-10 max-w-3xl font-mono text-base md:text-lg lg:text-xl leading-relaxed text-vault-gray-400">
              A sovereign private marketplace where security researchers securely monetize
              vulnerabilities. Fully encrypted vaults. Programmable Story Protocol CDR licensing.
              No public exposure. Perfect confidentiality.
            </p>

            <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row w-full max-w-md">
              <Link href="/submit" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 font-mono text-base font-bold"
                >
                  <Shield className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  SUBMIT REPORT
                  <ChevronRight className="h-5 w-5 opacity-60 transition-transform group-hover:translate-x-1.5 group-hover:opacity-100" />
                </motion.button>
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-secondary group flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 font-mono text-base"
                >
                  <Eye className="h-5 w-5 transition-transform group-hover:scale-110" />
                  BROWSE FINDINGS
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
