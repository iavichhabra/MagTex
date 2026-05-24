"use client";

import Link from "next/link";
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
  Critical: "text-vault-white border-vault-white",
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
    <Link href={`/report/${listing.id}`}>
      <div className="group relative border border-vault-gray-800 bg-vault-gray-950 p-5 transition-all hover:border-vault-gray-600 hover:bg-vault-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded border p-2 ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-semibold text-vault-white group-hover:underline">
                {listing.metadata?.title || "Untitled Report"}
              </h3>
              <p className="mt-1 font-mono text-xs text-vault-gray-500">
                {listing.metadata?.affectedProject || "Unknown Project"}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-vault-gray-400">
            {formatEther(listing.price)} IP
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-vault-gray-800 pt-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-vault-gray-500">
              {listing.metadata?.category || "Security Research"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-vault-gray-600">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-[10px]">
              {new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 bg-vault-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
