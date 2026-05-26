"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { Star } from "lucide-react";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { Review } from "@/types";

import { storyAeneid } from "@/lib/chains";

export function ReviewSystem({
  listingId,
  reviews,
}: {
  listingId: number;
  reviews: Review[];
}) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!walletClient || rating === 0) return;
    setSubmitting(true);
    await walletClient.writeContract({
      chain: storyAeneid,
      address: VULNVAULT_REGISTRY,
      abi: VULNVAULT_ABI,
      functionName: "submitReview",
      args: [BigInt(listingId), rating, comment],
    });
    setSubmitting(false);
    setRating(0);
    setComment("");
  };

  const avgRating = reviews.length
    ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
    : 0;

  return (
    <div className="border border-vault-gray-800 bg-vault-gray-950">
      <div className="border-b border-vault-gray-800 p-4">
        <h3 className="font-mono text-sm font-bold text-vault-white">
          VERIFIED REVIEWS ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${
                  s <= avgRating
                    ? "fill-vault-white text-vault-white"
                    : "text-vault-gray-600"
                }`}
              />
            ))}
            <span className="ml-2 font-mono text-xs text-vault-gray-400">
              {avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="mb-4 border-b border-vault-gray-800 pb-4 last:border-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-vault-gray-400">
                {review.reviewer.slice(0, 6)}...{review.reviewer.slice(-4)}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3 w-3 ${
                      s <= review.rating
                        ? "fill-vault-white text-vault-white"
                        : "text-vault-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 font-mono text-xs text-vault-gray-300">
              {review.comment}
            </p>
          </div>
        ))}

        <div className="mt-4 border-t border-vault-gray-800 pt-4">
          <p className="mb-2 font-mono text-xs text-vault-gray-500">SUBMIT REVIEW</p>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="p-1">
                <Star
                  className={`h-4 w-4 ${
                    s <= rating
                      ? "fill-vault-white text-vault-white"
                      : "text-vault-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-vault-gray-800 bg-vault-black p-2 font-mono text-xs text-vault-white"
            rows={3}
            placeholder="Your feedback..."
          />
          <button
            onClick={submit}
            disabled={submitting || rating === 0}
            className="mt-2 border border-vault-gray-600 px-4 py-2 font-mono text-xs text-vault-white hover:border-vault-white disabled:opacity-30"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
          </button>
        </div>
      </div>
    </div>
  );
}
