"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePublicClient } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { Listing, Review } from "@/types";
import { ProtectedPreview } from "@/components/protected-preview";
import { ReviewSystem } from "@/components/review-system";
import { ArrowLeft, Shield, Clock, Wallet } from "lucide-react";
import Link from "next/link";
import { formatEther } from "viem";
import { incrementListingViews } from "@/lib/analytics-utils";

export default function ReportPage() {
  const { id } = useParams();
  const publicClient = usePublicClient();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/marketplace"
        className="mb-6 flex items-center gap-2 font-mono text-xs text-vault-gray-400 hover:text-vault-white"
      >
        <ArrowLeft className="h-3 w-3" />
        BACK TO MARKETPLACE
      </Link>

      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6">
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

      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6">
        <h2 className="mb-4 font-mono text-sm font-bold text-vault-white">PUBLIC ABSTRACT</h2>
        <p className="font-mono text-sm leading-relaxed text-vault-gray-300 whitespace-pre-wrap">
          {listing.metadata?.abstract || "No abstract provided."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProtectedPreview listing={listing} />
        <ReviewSystem listingId={listing.id} reviews={reviews} />
      </div>
    </div>
  );
}
