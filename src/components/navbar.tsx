"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { Terminal, Shield, LayoutDashboard, Plus, Store } from "lucide-react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-vault-gray-800 bg-vault-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-vault-white" />
          <span className="font-mono text-lg font-bold tracking-wider text-vault-white">
            VULNVAULT
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 font-mono text-sm transition-colors ${
                pathname === link.href
                  ? "text-vault-white"
                  : "text-vault-gray-400 hover:text-vault-gray-200"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {mounted && isConnected && address && (
            <Link
              href={`/profile/${address}`}
              className="hidden font-mono text-xs text-vault-gray-400 hover:text-vault-white md:block"
            >
              PROFILE
            </Link>
          )}
          {mounted && (
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
