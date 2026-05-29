"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePublicClient, useWalletClient } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { Listing, Review } from "@/types";
import { ProtectedPreview } from "@/components/protected-preview";
import { ReviewSystem } from "@/components/review-system";
import { ArrowLeft, Shield, Clock, Wallet } from "lucide-react";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import { incrementListingViews } from "@/lib/analytics-utils";
import { storyAeneid } from "@/lib/chains";

export default function ReportPage() {
  const { id } = useParams();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Tipping states
  const [tipAmount, setTipAmount] = useState("1");
  const [tipping, setTipping] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [tipError, setTipError] = useState("");

  useEffect(() => {
    if (id) {
      incrementListingViews(Number(id));
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicClient || !id) return;
      try {
        const data = await publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "listings",
          args: [BigInt(id as string)],
        });

        let metadata;
        try {
          const res = await fetch(
            `https://gateway.pinata.cloud/ipfs/${data[4]}`
          );
          metadata = await res.json();
        } catch {}

        setListing({
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

        const reviewData = await publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "getListingReviews",
          args: [BigInt(id as string)],
        });

        setReviews(
          reviewData.map((r: any) => ({
            reviewer: r.reviewer,
            rating: r.rating,
            comment: r.comment,
            timestamp: r.timestamp,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicClient, id]);

  const handleTip = async () => {
    if (!walletClient) {
      setTipError("Please connect your wallet first.");
      return;
    }
    if (!tipAmount || Number(tipAmount) <= 0) {
      setTipError("Please enter a valid tip amount.");
      return;
    }
    if (!listing) return;

    setTipping(true);
    setTipError("");
    setTipSuccess(false);

    try {
      const tx = await walletClient.writeContract({
        chain: storyAeneid,
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "sendTip",
        args: [listing.seller],
        value: parseEther(tipAmount),
      });

      setTipSuccess(true);
      setTipAmount("1");
    } catch (err: any) {
      console.error(err);
      setTipError(err?.shortMessage || err?.message || "Tipping transaction failed. Check your wallet balance.");
    } finally {
      setTipping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-vault-gray-800 border-t-vault-white" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="font-mono text-vault-gray-400">Report not found</p>
      </div>
    );
  }

  const isTippingAllowed = listing.metadata?.isTippingEnabled ?? true;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/marketplace"
        className="mb-6 flex items-center gap-2 font-mono text-xs text-vault-gray-400 hover:text-vault-white w-max"
      >
        <ArrowLeft className="h-3 w-3" />
        BACK TO MARKETPLACE
      </Link>

      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-vault-accent" />
              <span className="font-mono text-sm font-bold text-vault-accent uppercase tracking-wider">
                {listing.metadata?.severity || "Severe"} Severity
              </span>
            </div>
            <h1 className="mt-3 font-mono text-3xl md:text-4xl font-bold text-vault-white">
              {listing.metadata?.title || "Untitled Report"}
            </h1>
            <p className="mt-2.5 font-mono text-base md:text-lg text-vault-gray-400">
              Target: {listing.metadata?.affectedProject || "Unknown Project"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl font-bold text-vault-white">
              {formatEther(listing.price)} IP
            </p>
            <div className="mt-2 flex items-center gap-2 text-vault-gray-500 justify-end">
              <Wallet className="h-3.5 w-3.5" />
              <span className="font-mono text-sm">
                Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-vault-gray-800 pt-4">
          <div className="flex items-center gap-1 text-vault-gray-500">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-xs">
              {new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}
            </span>
          </div>
          <span className="font-mono text-xs text-vault-gray-600">|</span>
          <span className="font-mono text-xs text-vault-gray-500">
            IP ID: {listing.ipId.slice(0, 10)}...
          </span>
          <span className="font-mono text-xs text-vault-gray-600">|</span>
          <span className="font-mono text-xs text-vault-gray-500">
            CDR: {listing.cdrUUID.slice(0, 8)}...
          </span>
        </div>
      </div>

      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg">
        <h2 className="mb-4 font-mono text-sm font-bold text-vault-white">PUBLIC ABSTRACT</h2>
        <p className="font-mono text-sm leading-relaxed text-vault-gray-300 whitespace-pre-wrap">
          {listing.metadata?.abstract || "No abstract provided."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProtectedPreview listing={listing} />
        
        <ReviewSystem listingId={listing.id} reviews={reviews} />

        {/* Voluntary Tipping Box */}
        {isTippingAllowed && (
          <div className="border border-vault-gray-800 bg-vault-gray-950 p-6 flex flex-col justify-between rounded-lg relative overflow-hidden group">
            {/* Ambient gold glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-vault-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 w-full">
              <h3 className="font-mono text-sm font-bold text-vault-white flex items-center gap-2 mb-2">
                💰 SUPPORT THE RESEARCHER
              </h3>
              <p className="font-mono text-xs text-vault-gray-500 leading-relaxed mb-4">
                Enjoyed this vulnerability research? Send a voluntary tip directly to the researcher's wallet to show appreciation.
              </p>

              {tipError && (
                <div className="mb-3 border border-red-800 bg-red-950/50 p-2 font-mono text-[10px] text-red-400">
                  {tipError}
                </div>
              )}

              {tipSuccess && (
                <div className="mb-3 border border-green-800 bg-green-950/50 p-2 font-mono text-[10px] text-green-400">
                  🎉 Tip sent successfully! Thank you.
                </div>
              )}

              {/* Quick tip selections */}
              <div className="mb-4">
                <span className="block font-mono text-[10px] text-vault-gray-500 uppercase mb-2">Select Amount</span>
                <div className="grid grid-cols-3 gap-2">
                  {["1", "5", "10"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTipAmount(val)}
                      className={`border py-1.5 font-mono text-xs transition-colors rounded ${
                        tipAmount === val
                          ? "border-vault-accent text-vault-accent bg-vault-accent/5 shadow-[0_0_8px_rgba(188,149,104,0.15)]"
                          : "border-vault-gray-800 text-vault-gray-400 hover:border-vault-gray-600 hover:text-vault-white"
                      }`}
                    >
                      {val} IP
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="mb-6">
                <span className="block font-mono text-[10px] text-vault-gray-500 uppercase mb-2">Custom Amount</span>
                <div className="relative">
                  <input
                    type="number"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Enter custom IP amount"
                    className="w-full border border-vault-gray-700 bg-vault-black py-2 pl-3 pr-10 font-mono text-xs text-vault-white focus:border-vault-white focus:outline-none"
                    step="0.1"
                    min="0.01"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-vault-gray-500 pointer-events-none">IP</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTip}
              disabled={tipping || !tipAmount || Number(tipAmount) <= 0}
              className="w-full border border-vault-accent bg-vault-accent/10 hover:bg-vault-accent/20 py-3 font-mono text-xs font-bold text-vault-accent transition-all rounded disabled:opacity-30 relative z-10"
            >
              {tipping ? "SENDING TIP..." : "SEND TIP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
