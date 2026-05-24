"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { Listing } from "@/types";
import { ReportCard } from "@/components/report-card";
import { BadgeDisplay } from "@/components/badge-display";
import { Shield, DollarSign, FileText } from "lucide-react";

export default function Dashboard() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [activeTab, setActiveTab] = useState<"researcher" | "buyer">("researcher");
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [purchased, setPurchased] = useState<Listing[]>([]);
  const [stats, setStats] = useState({
    reputation: 0n,
    earnings: 0n,
    tips: 0n,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!publicClient || !address) return;

      const [rep, earnings, tips] = await Promise.all([
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "reputationScore",
          args: [address],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "totalEarnings",
          args: [address],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "totalTips",
          args: [address],
        }),
      ]);

      setStats({ reputation: rep, earnings, tips });

      const sellerIds = await publicClient.readContract({
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "getSellerListings",
        args: [address],
      });

      const buyerIds = await publicClient.readContract({
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "getBuyerListings",
        args: [address],
      });

      const fetchListings = async (ids: readonly bigint[]) => {
        const result: Listing[] = [];
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
          result.push({
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
        return result;
      };

      const [sellerData, buyerData] = await Promise.all([
        fetchListings(sellerIds),
        fetchListings(buyerIds),
      ]);

      setMyListings(sellerData);
      setPurchased(buyerData);
    };

    fetchData();
  }, [publicClient, address]);

  if (!address) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-vault-gray-600" />
        <p className="font-mono text-vault-gray-400">Connect wallet to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-vault-white">DASHBOARD</h1>
            <p className="mt-1 font-mono text-xs text-vault-gray-500">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <BadgeDisplay
            profile={{
              address,
              reputationScore: stats.reputation,
              totalEarnings: stats.earnings,
              totalTips: stats.tips,
              listings: myListings.map((l) => l.id),
              badges: [],
            }}
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-vault-gray-800 pt-6">
          <div>
            <p className="font-mono text-2xl font-bold text-vault-white">
              {stats.reputation.toString()}
            </p>
            <p className="font-mono text-xs text-vault-gray-500">VULNERABILITIES REPORTED</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-vault-white">
              {(stats.earnings / 10n ** 18n).toString()} IP
            </p>
            <p className="font-mono text-xs text-vault-gray-500">TOTAL EARNINGS</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-vault-white">
              {(stats.tips / 10n ** 18n).toString()} IP
            </p>
            <p className="font-mono text-xs text-vault-gray-500">TIPS RECEIVED</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab("researcher")}
          className={`border px-6 py-2 font-mono text-sm ${
            activeTab === "researcher"
              ? "border-vault-white text-vault-white"
              : "border-vault-gray-800 text-vault-gray-500"
          }`}
        >
          RESEARCHER
        </button>
        <button
          onClick={() => setActiveTab("buyer")}
          className={`border px-6 py-2 font-mono text-sm ${
            activeTab === "buyer"
              ? "border-vault-white text-vault-white"
              : "border-vault-gray-800 text-vault-gray-500"
          }`}
        >
          BUYER
        </button>
      </div>

      {activeTab === "researcher" && (
        <div>
          <h2 className="mb-4 font-mono text-sm font-bold text-vault-white flex items-center gap-2">
            <FileText className="h-4 w-4" />
            MY REPORTS ({myListings.length})
          </h2>
          {myListings.length === 0 ? (
            <p className="font-mono text-xs text-vault-gray-600">No reports submitted yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myListings.map((l) => (
                <ReportCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "buyer" && (
        <div>
          <h2 className="mb-4 font-mono text-sm font-bold text-vault-white flex items-center gap-2">
            <Shield className="h-4 w-4" />
            PURCHASED REPORTS ({purchased.length})
          </h2>
          {purchased.length === 0 ? (
            <p className="font-mono text-xs text-vault-gray-600">No purchases yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {purchased.map((l) => (
                <ReportCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
