"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Store, Plus, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/", icon: Terminal, label: "Home" },
  { href: "/marketplace", icon: Store, label: "Market" },
  { href: "/submit", icon: Plus, label: "Submit" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dash" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-vault-gray-800 bg-vault-black/90 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 ${
              pathname === link.href ? "text-vault-white" : "text-vault-gray-500"
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span className="text-[10px] font-mono">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
