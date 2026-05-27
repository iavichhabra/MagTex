"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePublicClient, useAccount } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { ResearcherProfile, Listing } from "@/types";
import { ReportCard } from "@/components/report-card";
import { BadgeDisplay } from "@/components/badge-display";
import { ConnectSocials } from "@/components/connect-socials";
import { Shield, Wallet, TrendingUp, DollarSign, Star, Github, Globe, Twitter } from "lucide-react";
import { resolveSocialProfiles, fetchSellerSales } from "@/lib/analytics-utils";

export default function ProfilePage() {
  const { address } = useParams();
  const { address: currentAddress } = useAccount();
  const publicClient = usePublicClient();
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellerRating, setSellerRating] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [salesCount, setSalesCount] = useState<number>(0);

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

      // Fetch listings and compute ratings
      let totalRatingSum = 0;
      let totalReviews = 0;
      const fetched: Listing[] = [];
      const listingIdsNumeric = ids.map((id) => Number(id));

      for (const id of ids) {
        const data = await publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "listings",
          args: [id],
        });

        // Get reviews for this listing to calculate aggregate rating
        let avgRating: number | undefined;
        try {
          const reviews = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "getListingReviews",
            args: [id],
          });
          if (reviews && reviews.length > 0) {
            avgRating = reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / reviews.length;
            totalRatingSum += reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0);
            totalReviews += reviews.length;
          }
        } catch (e) {
          console.error("Error fetching reviews for listing in profile:", id, e);
        }

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
          metadata: {
            ...metadata,
            rating: avgRating,
          },
        });
      }

      // Fetch sales count from on-chain event logs
      const sales = await fetchSellerSales(publicClient, address as string, listingIdsNumeric);
      setSalesCount(sales.length);

      setSellerRating(totalReviews > 0 ? totalRatingSum / totalReviews : 0);
      setReviewsCount(totalReviews);

      setProfile({
        address: address as `0x${string}`,
        reputationScore: rep,
        totalEarnings: earnings,
        totalTips: tips,
        listings: listingIdsNumeric,
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

  const isSelf = currentAddress && address && (address as string).toLowerCase() === currentAddress.toLowerCase();
  const socials = resolveSocialProfiles(profile.address, currentAddress);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg relative overflow-hidden">
        {/* Glow styling */}
        <div className="absolute inset-0 bg-gradient-to-r from-vault-accent/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex h-16 w-16 items-center justify-center border-2 border-vault-gray-700 bg-vault-black shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] rounded-lg">
              <Wallet className="h-7 w-7 text-vault-gray-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-2xl font-bold text-vault-white tracking-wide">
                  {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
                </h1>
                
                {/* Verified Researcher badge */}
                {socials.isVerified && (
                  <span className="inline-flex items-center gap-1 border border-vault-accent bg-vault-accent/15 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider text-vault-accent uppercase">
                    <Shield className="h-3 w-3 fill-vault-accent/20" /> VERIFIED
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-vault-gray-500 uppercase tracking-widest mt-1">
                Security Researcher
              </p>

              {/* Display Socials */}
              {isSelf ? (
                <ConnectSocials />
              ) : (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {socials.x && (
                    <a
                      href={`https://x.com/${socials.x}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black/50 hover:border-vault-gray-600 px-2.5 py-1 font-mono text-[11px] text-vault-gray-400 hover:text-vault-white rounded transition-colors"
                    >
                      <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
                      <span>@{socials.x}</span>
                    </a>
                  )}
                  {socials.github && (
                    <a
                      href={`https://github.com/${socials.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black/50 hover:border-vault-gray-600 px-2.5 py-1 font-mono text-[11px] text-vault-gray-400 hover:text-vault-white rounded transition-colors"
                    >
                      <Github className="h-3.5 w-3.5 text-vault-white" />
                      <span>{socials.github}</span>
                    </a>
                  )}
                  {socials.hackerone && (
                    <a
                      href={`https://hackerone.com/${socials.hackerone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black/50 hover:border-vault-gray-600 px-2.5 py-1 font-mono text-[11px] text-vault-gray-400 hover:text-vault-white rounded transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5 text-[#f25f22]" />
                      <span>{socials.hackerone}</span>
                    </a>
                  )}
                  {socials.immunefi && (
                    <a
                      href={`https://immunefi.com/profile/${socials.immunefi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black/50 hover:border-vault-gray-600 px-2.5 py-1 font-mono text-[11px] text-vault-gray-400 hover:text-vault-white rounded transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5 text-[#1df296]" />
                      <span>{socials.immunefi}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end">
            {/* Display aggregate rating */}
            {reviewsCount > 0 ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 border border-vault-gray-800 bg-vault-black/40 px-3 py-1.5 rounded">
                  <span className="font-mono text-sm font-bold text-vault-white">{sellerRating.toFixed(1)}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= Math.round(sellerRating)
                            ? "fill-vault-accent text-vault-accent"
                            : "text-vault-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-vault-gray-500 mt-1 uppercase">
                  {reviewsCount} {reviewsCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            ) : (
              <span className="font-mono text-xs text-vault-gray-500 italic">No ratings yet</span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <BadgeDisplay profile={profile} />
        </div>

        {/* Transaction History & Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-vault-gray-800 pt-6 md:grid-cols-5">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {profile.reputationScore.toString()}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">REPORTS</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {listings.length}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">LISTINGS</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 border-l border-vault-gray-900 pl-3 md:pl-0 md:border-l-0">
            <TrendingUp className="h-5 w-5 text-vault-accent" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-accent">
                {salesCount}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">REPORTS SOLD</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <DollarSign className="h-5 w-5 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {(profile.totalEarnings / 10n ** 18n).toString()} IP
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">EARNINGS</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <DollarSign className="h-5 w-5 text-vault-gray-500" />
            <div>
              <p className="font-mono text-lg font-bold text-vault-white">
                {(profile.totalTips / 10n ** 18n).toString()} IP
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">TIPS</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 font-mono text-sm font-bold text-vault-white tracking-widest uppercase">
        REPORTS
      </h2>
      
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
