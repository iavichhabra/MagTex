"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Listing } from "@/types";
import { Shield, AlertTriangle, AlertCircle, Info, Clock } from "lucide-react";
import { formatEther } from "viem";

const SEVERITY_ICONS = {
  Critical: AlertTriangle,
  Severe: AlertTriangle,
  High: AlertCircle,
};

const SEVERITY_COLORS = {
  Critical: "text-vault-accent border-vault-accent shadow-[0_0_10px_rgba(188,149,104,0.3)]",
  Severe: "text-vault-white border-vault-white",
  High: "text-vault-gray-400 border-vault-gray-400",
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
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-mono text-base font-semibold text-vault-white transition-colors group-hover:text-vault-accent">
                {listing.metadata?.title || "Untitled Report"}
              </h3>
              <p className="mt-1 font-mono text-sm text-vault-gray-500 transition-colors group-hover:text-vault-gray-400">
                {listing.metadata?.affectedProject || "Unknown Project"}
              </p>
              {/* Verified badge */}
              {listing.metadata?.verified && (
                <span className="mt-1 inline-block rounded bg-yellow-500 px-2 py-0.5 text-xs font-medium text-black">
                  Verified
                </span>
              )}
              {/* Rating stars */}
              {typeof listing.metadata?.rating === "number" && (
                <div className="mt-1 flex items-center space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < (listing.metadata?.rating ?? 0) ? "text-vault-accent" : "text-vault-gray-600"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.366 2.447c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.652 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                  ))}
                </div>
              )}
              {/* View count */}
              {typeof listing.metadata?.viewCount === "number" && (
                <p className="mt-1 text-xs text-vault-gray-400">
                  {listing.metadata.viewCount} views
                </p>
              )}
            </div>
          </div>
          <motion.div 
            className="flex flex-col items-end"
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-mono text-base font-bold text-vault-gray-300 transition-colors group-hover:text-vault-white">
              {formatEther(listing.price)}
            </span>
            <span className="font-mono text-xs text-vault-gray-500">IP</span>
          </motion.div>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-vault-gray-800/50 pt-3 transition-colors group-hover:border-vault-gray-700">
            <div className="flex items-center gap-1.5 text-vault-gray-600 transition-colors group-hover:text-vault-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">
                {new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}
              </span>
            </div>
            {/* Additional stats could go here */}
          </div>
        </div>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
    </Link>
  );
}
