"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Shield, Eye, ChevronRight, Lock, FileKey, Users, Zap, ArrowRight, Globe, KeyRound } from "lucide-react";
import { IntroAnimation } from "@/components/intro-animation";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";

/* ─── Fade-in wrapper ─── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function AnimatedNumber({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(eased * target);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <span ref={ref} className="stat-number">
      {count.toFixed(decimals)}{suffix}
    </span>
  );
}

/* ─── How It Works steps ─── */
const STEPS = [
  {
    icon: Lock,
    title: "Encrypt & Submit",
    desc: "AES-256 encrypt your vulnerability report locally in-browser. Your findings never touch our servers unencrypted.",
  },
  {
    icon: FileKey,
    title: "Set Your Terms",
    desc: "Choose your price, visibility, and buyer approval rules. Create private listings or whitelist-only access.",
  },
  {
    icon: Zap,
    title: "Get Paid Securely",
    desc: "Buyers purchase access on-chain via Story Protocol CDR. You receive IP tokens directly to your wallet.",
  },
];

/* ─── Feature cards ─── */
const FEATURES = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    desc: "Every report is encrypted locally before upload. Central servers never see your original findings.",
  },
  {
    icon: Globe,
    title: "CDR Licensing",
    desc: "Built on Story Protocol Cross-Chain Data Rights for programmable, sovereign vulnerability licensing.",
  },
  {
    icon: Eye,
    title: "Private Listings",
    desc: "Create hidden listings accessible only via direct link. Full control over who discovers your research.",
  },
  {
    icon: KeyRound,
    title: "Whitelist Access",
    desc: "Approve buyers before they purchase. Gate access to sensitive research behind on-chain verification.",
  },
];

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);
  const publicClient = usePublicClient();
  const [stats, setStats] = useState({
    reportsListed: 0,
    totalValueLocked: 0,
    researchersActive: 0,
    avgPrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicClient) return;
    const loadStats = async () => {
      try {
        const count = await publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "listingCounter",
        });

        const listingCount = Number(count);
        if (listingCount === 0) {
          setStats({
            reportsListed: 0,
            totalValueLocked: 0,
            researchersActive: 0,
            avgPrice: 0,
          });
          return;
        }

        const contracts = [];
        for (let i = 1; i <= listingCount; i++) {
          contracts.push({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "listings",
            args: [BigInt(i)],
          });
        }

        const results = await publicClient.multicall({
          contracts,
        });

        let totalPrice = BigInt(0);
        const uniqueSellers = new Set<string>();
        let activeCount = 0;

        results.forEach((res) => {
          if (res.status === "success" && res.result) {
            const listing = res.result as any;
            const seller = listing[0];
            const price = listing[3];
            const active = listing[5];

            if (active) {
              totalPrice += price;
              uniqueSellers.add(seller);
              activeCount++;
            }
          }
        });

        const tvlEth = parseFloat(formatEther(totalPrice));

        setStats({
          reportsListed: activeCount,
          totalValueLocked: tvlEth,
          researchersActive: uniqueSellers.size,
          avgPrice: activeCount > 0 ? tvlEth / activeCount : 0,
        });
      } catch (err) {
        console.error("Failed to load on-chain stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  const statsList = [
    { label: "Reports Listed", value: stats.reportsListed, suffix: "+", decimals: 0 },
    { label: "Total Value Locked", value: stats.totalValueLocked, suffix: " IP", decimals: 2 },
    { label: "Researchers Active", value: stats.researchersActive, suffix: "+", decimals: 0 },
    { label: "Avg. Listing Price", value: stats.avgPrice, suffix: " IP", decimals: 2 },
  ];

  return (
    <>
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}

      {/* ═══════════════════ SECTION 1 — HERO ═══════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-20 bg-vault-black dot-grid opacity-20" />
        <div className="absolute inset-0 -z-10 scanline-overlay opacity-20" />
        {/* Gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-vault-accent/8 blur-[150px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] -z-10 h-[300px] w-[300px] rounded-full bg-vault-cyan/5 blur-[120px] pointer-events-none animate-float-gentle" />

        <div className="mx-auto max-w-5xl px-6 py-20 md:py-32 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-2.5 mb-8 rounded-full border border-vault-gray-800 bg-vault-gray-950/60 px-5 py-2 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vault-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-vault-accent" />
              </span>
              <span className="font-mono text-xs font-medium text-vault-gray-400 tracking-widest">
                STORY PROTOCOL CDR ACTIVE
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="font-display text-4xl font-black tracking-tight md:text-6xl lg:text-7xl leading-[1.05] text-vault-white">
              Secure disclosure
              <br />
              for the world&apos;s{" "}
              <span className="text-gradient">vulnerabilities</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-vault-gray-400">
              A sovereign private marketplace where security researchers securely monetize
              their findings. Fully encrypted vaults. Programmable licensing.
              No public exposure. Perfect confidentiality.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row w-full max-w-md">
              <Link href="/submit" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 text-sm font-bold"
                >
                  <Shield className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Submit Report
                  <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-secondary group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 text-sm"
                >
                  <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Browse Findings
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-vault-black to-transparent pointer-events-none" />
      </section>



      {/* ═══════════════════ SECTION 2 — STATS ═══════════════════ */}
      <section className="relative border-y border-vault-gray-800/50 bg-vault-gray-950/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsList.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1} className="text-center">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                <p className="mt-2 font-mono text-xs tracking-wider text-vault-gray-500 uppercase">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3 — HOW IT WORKS ═══════════════════ */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center mb-20">
            <span className="section-label">How it works</span>
            <h2 className="section-heading mt-4">
              From discovery to{" "}
              <span className="text-gradient-accent">compensation</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.15}>
                <div className="feature-card group h-full">
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-vault-accent/10 border border-vault-accent/20 text-vault-accent font-mono text-sm font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <step.icon className="h-5 w-5 text-vault-accent/60 group-hover:text-vault-accent transition-colors" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-vault-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-vault-gray-400">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4 — FEATURES ═══════════════════ */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        {/* Subtle radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(188,149,104,0.04)_0%,_transparent_60%)] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 relative">
          <Reveal className="text-center mb-20">
            <span className="section-label">Why MagTex</span>
            <h2 className="section-heading mt-4">
              Built for researchers who{" "}
              <span className="text-gradient-accent">defend the web</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 0.1}>
                <div className="feature-card group h-full flex gap-5">
                  <div className="flex-shrink-0 flex items-start pt-1">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-vault-accent/10 border border-vault-accent/15 group-hover:bg-vault-accent/15 transition-colors">
                      <feat.icon className="h-5 w-5 text-vault-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-vault-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-vault-gray-400">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5 — CTA BANNER ═══════════════════ */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-vault-accent/15 via-vault-gray-950 to-vault-cyan/10" />
              <div className="absolute inset-0 border border-vault-accent/20 rounded-3xl" />

              <div className="relative px-8 py-16 md:px-16 md:py-24">
                <span className="section-label">Get started</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-vault-white tracking-tight mt-4 mb-6">
                  Ready to monetize your research?
                </h2>
                <p className="text-vault-gray-400 max-w-xl mx-auto mb-10 text-base">
                  Join MagTex and turn your security expertise into sovereign, encrypted assets.
                  Your findings, your terms, your revenue.
                </p>
                <Link href="/submit">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base font-bold"
                  >
                    Start Submitting
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ SECTION 6 — FOOTER ═══════════════════ */}
      <footer className="border-t border-vault-gray-800/50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-vault-accent" />
              <span className="font-display text-lg font-bold tracking-wide text-vault-white">
                MAGTEX
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8">
              <Link href="/marketplace" className="text-sm text-vault-gray-400 hover:text-vault-white transition-colors">
                Marketplace
              </Link>
              <Link href="/submit" className="text-sm text-vault-gray-400 hover:text-vault-white transition-colors">
                Submit
              </Link>
              <Link href="/dashboard" className="text-sm text-vault-gray-400 hover:text-vault-white transition-colors">
                Dashboard
              </Link>
              <Link href="/faq" className="text-sm text-vault-gray-400 hover:text-vault-white transition-colors">
                FAQ
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/Magtex_?s=20"
                target="_blank"
                rel="noreferrer"
                className="text-vault-gray-500 hover:text-vault-accent transition-colors text-sm"
              >
                @Magtex_
              </a>
              <span className="text-vault-gray-700 text-xs">•</span>
              <span className="font-mono text-xs text-vault-gray-600">
                Built on Story Protocol
              </span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-vault-gray-800/30 text-center">
            <p className="font-mono text-xs text-vault-gray-600">
              © {new Date().getFullYear()} MagTex. Disclosure without exposure.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
