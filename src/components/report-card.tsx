"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Listing } from "@/types";
import { Shield, AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";
import { formatEther } from "viem";

const SEVERITY_ICONS = {
  Critical: AlertTriangle,
  High: AlertTriangle,
  Medium: AlertCircle,
  Low: Info,
  Informational: Info,
};

const SEVERITY_COLORS = {
  Critical: "text-vault-white border-vault-white shadow-[0_0_10px_rgba(255,255,255,0.3)]",
  High: "text-vault-gray-200 border-vault-gray-200",
  Medium: "text-vault-gray-400 border-vault-gray-400",
  Low: "text-vault-gray-500 border-vault-gray-500",
  Informational: "text-vault-gray-600 border-vault-gray-600",
};

export function ReportCard({ listing }: { listing: Listing }) {
  const Icon =
    SEVERITY_ICONS[listing.metadata?.severity as keyof typeof SEVERITY_ICONS] ||
    Shield;
  const colorClass =
    SEVERITY_COLORS[listing.metadata?.severity as keyof typeof SEVERITY_COLORS] ||
    "";

  return (
    <Link href={`/report/${listing.id}`} className="block h-full">
      <motion.div 
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.3 }}
        className="group relative h-full flex flex-col border border-vault-gray-800 bg-vault-gray-950 p-5 transition-all duration-300 hover:border-vault-gray-600 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden rounded-lg"
      >
        {/* Animated gradient scanline on hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-vault-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        
        {/* Subtle glow border effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`rounded border p-2 transition-all duration-300 group-hover:scale-110 ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-vault-white transition-colors group-hover:text-vault-accent">
                {listing.metadata?.title || "Untitled Report"}
              </h3>
              <p className="mt-1 font-mono text-xs text-vault-gray-500 transition-colors group-hover:text-vault-gray-400">
                {listing.metadata?.affectedProject || "Unknown Project"}
              </p>
            </div>
          </div>
          <motion.div 
            className="flex flex-col items-end"
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-mono text-xs font-bold text-vault-gray-300 transition-colors group-hover:text-vault-white">
              {formatEther(listing.price)}
            </span>
            <span className="font-mono text-[10px] text-vault-gray-500">IP</span>
          </motion.div>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-vault-gray-800/50 pt-3 transition-colors group-hover:border-vault-gray-700">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-vault-gray-900 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-vault-gray-400 transition-colors group-hover:bg-vault-gray-800 group-hover:text-vault-gray-300">
                {listing.metadata?.category || "Security Research"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-vault-gray-600 transition-colors group-hover:text-vault-gray-400">
              <Clock className="h-3 w-3" />
              <span className="font-mono text-[10px]">
                {new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
    </Link>
  );
}
