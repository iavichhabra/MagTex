"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Store, Plus, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/", icon: Terminal, label: "Home" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/submit", icon: Plus, label: "Submit" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dash" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-vault-black/90 backdrop-blur-xl md:hidden pb-safe"
    >
      {/* Subtle animated top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-vault-gray-600/50 to-transparent" />
      
      <div className="flex h-16 items-center justify-around px-2 relative">
        {LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 h-full"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
                  isActive ? "text-vault-white" : "text-vault-gray-500 hover:text-vault-gray-300"
                }`}
              >
                <link.icon 
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isActive ? "scale-110" : ""
                  }`} 
                />
                <span className="text-[10px] font-mono tracking-wider">{link.label}</span>
              </motion.div>
              
              {/* Active glow background */}
              {isActive && (
                <motion.div 
                  layoutId="mobileNavActive"
                  className="absolute inset-0 -z-10 bg-vault-white/5 rounded-lg m-1"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
        <div className="flex h-full items-center justify-center pl-2 border-l border-vault-gray-800/50">
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
