"use client";

import { ResearcherProfile } from "@/types";
import { Shield, Bug, Award, Zap, TrendingUp, CheckCircle, Github, Globe } from "lucide-react";
import { resolveSocialProfiles } from "@/lib/analytics-utils";
import { useAccount } from "wagmi";

const BADGE_CONFIG = [
  { id: "first_report", label: "First Report", icon: Shield, min: 1 },
  { id: "bug_hunter", label: "Bug Hunter", icon: Bug, min: 5 },
  { id: "security_researcher", label: "Security Researcher", icon: Award, min: 10 },
  { id: "critical_finder", label: "Critical Finder", icon: Zap, min: 3 },
  { id: "top_researcher", label: "Top Researcher", icon: TrendingUp, min: 25 },
  { id: "trusted_reporter", label: "Trusted Reporter", icon: CheckCircle, min: 50 },
];

export function BadgeDisplay({ profile }: { profile: ResearcherProfile }) {
  const { address: currentAddress } = useAccount();
  const socials = resolveSocialProfiles(profile.address, currentAddress);

  const earned = BADGE_CONFIG.filter((b) => {
    if (b.id === "critical_finder") return profile.reputationScore >= 3n;
    return Number(profile.reputationScore) >= b.min;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {/* Platform Verification Badges first (looks premium) */}
      {socials.github && (
        <div className="flex items-center gap-1.5 border border-vault-accent/30 bg-vault-accent/5 px-3 py-1.5 rounded">
          <Github className="h-3 w-3 text-vault-accent" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-vault-accent font-bold">
            GITHUB VERIFIED
          </span>
        </div>
      )}
      {socials.hackerone && (
        <div className="flex items-center gap-1.5 border border-[#f25f22]/30 bg-[#f25f22]/5 px-3 py-1.5 rounded">
          <Globe className="h-3 w-3 text-[#f25f22]" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#f25f22] font-bold">
            H1 VERIFIED
          </span>
        </div>
      )}
      {socials.immunefi && (
        <div className="flex items-center gap-1.5 border border-[#1df296]/30 bg-[#1df296]/5 px-3 py-1.5 rounded">
          <Globe className="h-3 w-3 text-[#1df296]" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#1df296] font-bold">
            IMMUNEFI VERIFIED
          </span>
        </div>
      )}

      {/* Reputation Score Badges */}
      {earned.map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-gray-900 px-3 py-1.5 rounded"
        >
          <badge.icon className="h-3 w-3 text-vault-gray-400" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-300">
            {badge.label}
          </span>
        </div>
      ))}
      
      {earned.length === 0 && !socials.github && !socials.hackerone && !socials.immunefi && (
        <span className="font-mono text-xs text-vault-gray-600">No badges yet</span>
      )}
    </div>
  );
}
