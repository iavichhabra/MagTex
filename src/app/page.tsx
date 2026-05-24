"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, DollarSign } from "lucide-react";
import { IntroAnimation } from "@/components/intro-animation";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="font-mono text-4xl font-bold tracking-tight text-vault-white md:text-6xl lg:text-7xl">
              DISCLOSURE WITHOUT
              <br />
              <span className="text-vault-gray-400">EXPOSURE</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-vault-gray-400 md:text-base">
              A private marketplace where security researchers can securely sell
              vulnerability research through Story Protocol CDR. Encrypted
              vaults. Programmable permissions. Restricted buyers. Zero public
              exposure.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/submit"
                className="flex items-center gap-2 border border-vault-white bg-vault-white px-8 py-3 font-mono text-sm font-bold text-vault-black transition-colors hover:bg-vault-gray-200"
              >
                <Shield className="h-4 w-4" />
                SUBMIT REPORT
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 border border-vault-gray-600 px-8 py-3 font-mono text-sm text-vault-white transition-colors hover:border-vault-white"
              >
                <Eye className="h-4 w-4" />
                BROWSE FINDINGS
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="border border-vault-gray-800 bg-vault-gray-950 p-6"
              >
                <step.icon className="mb-4 h-6 w-6 text-vault-gray-400" />
                <h3 className="font-mono text-sm font-bold text-vault-white">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-vault-gray-500">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-32 border-t border-vault-gray-800 pt-16"
          >
            <h2 className="text-center font-mono text-2xl font-bold text-vault-white">
              WHY CONFIDENTIAL DATA RAILS
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
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
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-vault-white" />
                  <div>
                    <h3 className="font-mono text-sm font-bold text-vault-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-vault-gray-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
