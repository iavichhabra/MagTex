"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { ReportCard } from "@/components/report-card";
import { Listing } from "@/types";
import { Search, Filter } from "lucide-react";

export default function Marketplace() {
  const publicClient = usePublicClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!publicClient) return;
      try {
        const count = await publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "listingCounter",
        });

        const fetched: Listing[] = [];
        for (let i = 1; i <= Number(count); i++) {
          const listing = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "listings",
            args: [BigInt(i)],
          });

          if (!listing[5]) continue;

          let metadata;
          try {
            const res = await fetch(
              `https://gateway.pinata.cloud/ipfs/${listing[4]}`
            );
            metadata = await res.json();
          } catch {}

          fetched.push({
            id: i,
            seller: listing[0],
            ipId: listing[1],
            cdrUUID: listing[2],
            price: listing[3],
            metadataURI: listing[4],
            active: listing[5],
            licenseTermsId: listing[6],
            createdAt: listing[7],
            metadata,
          });
        }

        setListings(fetched.reverse());
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    const interval = setInterval(fetchListings, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  const filtered = listings.filter((l) => {
    const matchesFilter =
      !filter ||
      l.metadata?.title?.toLowerCase().includes(filter.toLowerCase()) ||
      l.metadata?.affectedProject?.toLowerCase().includes(filter.toLowerCase());
    return matchesFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-mono text-3xl font-bold text-vault-white">MARKETPLACE</h1>
          <p className="mt-1 font-mono text-sm text-vault-gray-500">
            {listings.length} REPORTS AVAILABLE
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-vault-gray-600" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search projects..."
              className="w-full border border-vault-gray-800 bg-vault-black py-2.5 pl-10 pr-4 font-mono text-base text-vault-white focus:border-vault-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-vault-gray-800 border-t-vault-white" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-vault-gray-800 bg-vault-gray-950 py-20 text-center">
          <Filter className="mx-auto mb-4 h-8 w-8 text-vault-gray-600" />
          <p className="font-mono text-sm text-vault-gray-400">No reports found</p>
          <p className="mt-2 font-mono text-xs text-vault-gray-600">
            The marketplace starts empty. Be the first to submit.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ReportCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
