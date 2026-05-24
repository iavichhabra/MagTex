"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePublicClient } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { ResearcherProfile, Listing } from "@/types";
import { ReportCard } from "@/components/report-card";
import { BadgeDisplay } from "@/components/badge-display";
import { Shield, Wallet, TrendingUp, DollarSign } from "lucide-react";

export default function ProfilePage() {
  const { address } = useParams();
  const publicClient = usePublicClient();
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!publicClient || !address) return;

      const [rep, earnings, tips, ids] = await Promise.all([
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "reputationScore",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "totalEarnings",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "totalTips",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "getSellerListings",
          args: [address as `0x${string}`],
        }),
      ]);

      const fetched: Listing[] = [];
      for (const id of ids) {
        const data = await publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "listings",
          args: [id],
        });
        let metadata;
        try {
          const res = await fetch(
            `https://gateway.pinata.cloud/ipfs/${data[4]}`
          );
          metadata = await res.json();
        } catch {}
        fetched.push({
          id: Number(id),
          seller: data[0],
          ipId: data[1],
          cdrUUID: data[2],
          price: data[3],
          metadataURI: data[4],
          active: data[5],
          licenseTermsId: data[6],
          createdAt: data[7],
          metadata,
        });
      }

      setProfile({
        address: address as `0x${string}`,
        reputationScore: rep,
        totalEarnings: earnings,
        totalTips: tips,
        listings: fetched.map((l) => l.id),
        badges: [],
      });
      setListings(fetched);
    };

    fetchProfile();
  }, [publicClient, address]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vault-gray-800 border-t-vault-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border border-vault-gray-700 bg-vault-black">
            <Wallet className="h-5 w-5 text-vault-gray-400" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold text-vault-white">
              {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
            </h1>
            <p className="font-mono text-xs text-vault-gray-500">Security Researcher</p>
          </div>
        </div>

        <div className="mt-6">
          <BadgeDisplay profile={profile} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-vault-gray-800 pt-6 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {profile.reputationScore.toString()}
              </p>
              <p className="font-mono text-[10px] text-vault-gray-500">REPORTS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {listings.length}
              </p>
              <p className="font-mono text-[10px] text-vault-gray-500">LISTINGS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {(profile.totalEarnings / 10n ** 18n).toString()} IP
              </p>
              <p className="font-mono text-[10px] text-vault-gray-500">EARNINGS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {(profile.totalTips / 10n ** 18n).toString()} IP
              </p>
              <p className="font-mono text-[10px] text-vault-gray-500">TIPS</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 font-mono text-sm font-bold text-vault-white">REPORTS</h2>
      {listings.length === 0 ? (
        <p className="font-mono text-xs text-vault-gray-600">No reports published</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ReportCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
