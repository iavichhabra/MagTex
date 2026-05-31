"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { Shield, LayoutDashboard, Plus, Store, HelpCircle, User } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Shield },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/submit", label: "Submit", icon: Plus },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 20);
    // Hide on scroll down, show on scroll up (smart navbar)
    if (latest > 200 && latest > previous) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: isHidden ? -100 : 0, 
        opacity: isHidden ? 0 : 1 
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40 px-4 pt-3"
    >
      <div
        className={`mx-auto max-w-6xl transition-all duration-500 rounded-2xl ${
          isScrolled
            ? "glass-float shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative">
              <Shield className="h-5 w-5 text-vault-accent transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-vault-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display text-lg font-bold tracking-wide text-vault-white transition-colors group-hover:text-vault-accent">
              MAGTEX
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-vault-accent/10 border border-vault-accent/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <link.icon
                    className={`relative z-10 h-4 w-4 transition-all duration-300 ${
                      isActive
                        ? "text-vault-accent"
                        : "text-vault-gray-500 group-hover:text-vault-gray-300"
                    }`}
                  />
                  <span
                    className={`relative z-10 transition-colors duration-300 ${
                      isActive
                        ? "text-vault-accent"
                        : "text-vault-gray-400 group-hover:text-vault-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {mounted && isConnected && address && (
              <Link
                href={`/profile/${address}`}
                className="hidden md:flex items-center gap-1.5 text-xs text-vault-gray-400 hover:text-vault-accent transition-colors px-3 py-1.5 rounded-lg hover:bg-vault-accent/5"
              >
                <User className="h-3.5 w-3.5" />
                <span className="font-mono">PROFILE</span>
              </Link>
            )}
            <ThemeToggle />
            {mounted && (
              <div className="transition-transform hover:scale-[1.02]">
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus="address"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
