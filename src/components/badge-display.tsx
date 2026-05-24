"use client";

import { ResearcherProfile } from "@/types";
import { Shield, Bug, Award, Zap, TrendingUp, CheckCircle } from "lucide-react";

const BADGE_CONFIG = [
  { id: "first_report", label: "First Report", icon: Shield, min: 1 },
  { id: "bug_hunter", label: "Bug Hunter", icon: Bug, min: 5 },
  { id: "security_researcher", label: "Security Researcher", icon: Award, min: 10 },
  { id: "critical_finder", label: "Critical Finder", icon: Zap, min: 3 },
  { id: "top_researcher", label: "Top Researcher", icon: TrendingUp, min: 25 },
  { id: "trusted_reporter", label: "Trusted Reporter", icon: CheckCircle, min: 50 },
];

export function BadgeDisplay({ profile }: { profile: ResearcherProfile }) {
  const earned = BADGE_CONFIG.filter((b) => {
    if (b.id === "critical_finder") return profile.reputationScore >= 3n;
    return Number(profile.reputationScore) >= b.min;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {earned.map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-1.5 border border-vault-gray-700 bg-vault-gray-900 px-3 py-1.5"
        >
          <badge.icon className="h-3 w-3 text-vault-gray-300" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-vault-gray-300">
            {badge.label}
          </span>
        </div>
      ))}
      {earned.length === 0 && (
        <span className="font-mono text-xs text-vault-gray-600">No badges yet</span>
      )}
    </div>
  );
}
