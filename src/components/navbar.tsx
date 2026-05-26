"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { Terminal, Shield, LayoutDashboard, Plus, Store } from "lucide-react";
import { motion, useScroll } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Terminal },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/submit", label: "Submit", icon: Plus },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? "bg-vault-black/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-vault-gray-800" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-vault-gray-600/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative">
            <Shield className="h-5 w-5 text-vault-white transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-vault-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-mono text-lg font-bold tracking-wider text-vault-white transition-colors group-hover:text-vault-gray-200">
            VULNVAULT
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative flex items-center gap-2 py-2 font-mono text-sm"
              >
                <link.icon 
                  className={`h-4 w-4 transition-all duration-300 ${
                    isActive ? "text-vault-white scale-110" : "text-vault-gray-500 group-hover:text-vault-gray-300 group-hover:scale-110"
                  }`} 
                />
                <span className={`transition-colors duration-300 ${
                  isActive ? "text-vault-white" : "text-vault-gray-400 group-hover:text-vault-gray-200"
                }`}>
                  {link.label}
                </span>
                
                {/* Hover underline */}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-vault-white transition-all duration-300 ${
                  isActive ? "w-full" : "w-0 group-hover:w-full opacity-50"
                }`} />
                
                {/* Active glow dot */}
                {isActive && (
                  <motion.span 
                    layoutId="activeNav"
                    className="absolute -bottom-[5px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-vault-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {mounted && isConnected && address && (
            <Link
              href={`/profile/${address}`}
              className="hidden font-mono text-xs text-vault-gray-400 hover:text-vault-white hover-underline md:block px-2"
            >
              PROFILE
            </Link>
          )}
          {mounted && (
            <>
              <ThemeToggle />
              <div className="transition-transform hover:scale-105">
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus="address"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
