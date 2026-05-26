"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, DollarSign, ChevronRight } from "lucide-react";
import { IntroAnimation } from "@/components/intro-animation";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      <div className="relative min-h-screen overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-20 bg-vault-black dot-grid opacity-30" />
        <div className="absolute inset-0 -z-10 scanline-overlay opacity-50" />
        <div className="absolute -top-[300px] left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-vault-accent/5 opacity-50 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <div className="inline-block mb-6 rounded-full border border-vault-gray-800 bg-vault-gray-950/50 px-4 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-xs text-vault-gray-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-vault-accent"></span>
                </span>
                STORY PROTOCOL CDR LIVE
              </span>
            </div>
            
            <h1 className="font-mono text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-vault-white">DISCLOSURE</span> WITHOUT
              <br />
              <span className="text-gradient">EXPOSURE</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-vault-gray-400 md:text-base">
              A private marketplace where security researchers can securely sell
              vulnerability research through Story Protocol CDR. Encrypted
              vaults. Programmable permissions. Restricted buyers. Zero public
              exposure.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/submit">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary group flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  SUBMIT REPORT
                  <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
                </motion.button>
              </Link>
              <Link href="/marketplace">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary group flex items-center gap-2"
                >
                  <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                  BROWSE FINDINGS
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <div className="mt-32 grid gap-8 md:grid-cols-4">
            {[
              { icon: Eye, title: "Discover", desc: "Find vulnerabilities in target projects" },
              { icon: Lock, title: "Encrypt", desc: "AES-256 + CDR threshold encryption" },
              { icon: Shield, title: "Restrict Access", desc: "Define exactly who can purchase" },
              { icon: DollarSign, title: "Sell Securely", desc: "Programmable private IP monetization" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-hover p-6 group rounded-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-vault-gray-800 bg-vault-black transition-colors group-hover:border-vault-gray-600 group-hover:bg-vault-gray-900">
                  <step.icon className="h-5 w-5 text-vault-gray-400 transition-transform group-hover:scale-110 group-hover:text-vault-white" />
                </div>
                <h3 className="font-mono text-sm font-bold text-vault-white transition-colors group-hover:text-vault-accent">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-vault-gray-500 transition-colors group-hover:text-vault-gray-400">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 border-t border-vault-gray-800 pt-16 relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-vault-black px-4">
              <div className="h-2 w-2 rounded-full bg-vault-gray-800 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
            </div>
            
            <h2 className="text-center font-mono text-2xl font-bold text-vault-white">
              WHY CONFIDENTIAL DATA RAILS
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 relative z-10">
              {[
                {
                  title: "Encrypted Vaults",
                  desc: "Data keys protected by distributed threshold cryptography. No single validator holds the full key.",
                },
                {
                  title: "Programmable Permissions",
                  desc: "Access conditions enforced by smart contracts. Time-locks, role-based access, buyer allowlists.",
                },
                {
                  title: "Restricted Buyers",
                  desc: "Researchers choose exactly who can decrypt. Project security teams, multisigs, or specific wallets only.",
                },
                {
                  title: "Private Disclosures",
                  desc: "Never publish vulnerabilities publicly. Sell to authorized parties through private markets.",
                },
              ].map((item, i) => (
                <motion.div 
                  key={item.title} 
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group p-4 -m-4 rounded-lg hover:bg-vault-gray-900/50 transition-colors"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-vault-gray-700 transition-colors group-hover:bg-vault-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  <div>
                    <h3 className="font-mono text-sm font-bold text-vault-white transition-colors group-hover:text-vault-accent">
                      {item.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-vault-gray-500 group-hover:text-vault-gray-400 transition-colors">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Decorative background elements for CDR section */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </>
  );
}
