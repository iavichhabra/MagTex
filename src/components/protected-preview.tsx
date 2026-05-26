"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Lock, Unlock, Eye, Download, Send } from "lucide-react";
import { Listing } from "@/types";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";

import { importAESKey, decryptFile } from "@/lib/crypto";
import { getIPFSUrl } from "@/lib/ipfs";
import { storyAeneid } from "@/lib/chains";

export function ProtectedPreview({ listing }: { listing: Listing }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [hasAccess, setHasAccess] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState("");
  const [decryptedFilename, setDecryptedFilename] = useState("report");

  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [interestedBuyers, setInterestedBuyers] = useState<string[]>([]);
  
  const isSeller = address?.toLowerCase() === listing.seller.toLowerCase();
  const isWhitelistOnly = listing.metadata?.isWhitelistOnly || false;

  const checkAccess = async () => {
    if (!address || !publicClient) return;
    try {
      const access = await publicClient.readContract({
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "hasAccess",
        args: [address, BigInt(listing.id)],
      });
      setHasAccess(access);

      if (isWhitelistOnly) {
        if (!isSeller) {
          const whitelisted = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "whitelistedBuyers",
            args: [BigInt(listing.id), address],
          });
          setIsWhitelisted(whitelisted as boolean);

          const expressed = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "hasExpressedInterest",
            args: [BigInt(listing.id), address],
          });
          setHasExpressedInterest(expressed as boolean);
        } else {
          const buyers = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "getInterestedBuyers",
            args: [BigInt(listing.id)],
          });
          setInterestedBuyers(buyers as string[]);
        }
      }
    } catch (err) {
      console.error("Failed to check access:", err);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [address, publicClient, listing.id, isWhitelistOnly, isSeller]);

  const purchase = async () => {
    if (!walletClient || !address) return;
    await walletClient.writeContract({
      chain: storyAeneid,
      address: VULNVAULT_REGISTRY,
      abi: VULNVAULT_ABI,
      functionName: "purchaseReport",
      args: [BigInt(listing.id)],
      value: listing.price,
    });
    await checkAccess();
  };

  const expressInterest = async () => {
    if (!walletClient || !address) return;
    setIsExpressingInterest(true);
    try {
      await walletClient.writeContract({
        chain: storyAeneid,
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "expressInterest",
        args: [BigInt(listing.id)],
      });
      setHasExpressedInterest(true);
    } catch (err) {
      console.error("Failed to express interest:", err);
    } finally {
      setIsExpressingInterest(false);
    }
  };

  const approveBuyer = async (buyerAddr: string) => {
    if (!walletClient || !address) return;
    try {
      await walletClient.writeContract({
        chain: storyAeneid,
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "approveBuyer",
        args: [BigInt(listing.id), buyerAddr as `0x${string}`],
      });
      alert("Buyer approved! They can now purchase the report.");
    } catch (err) {
      console.error("Failed to approve buyer:", err);
    }
  };

  const unlock = async () => {
    if (!walletClient) return;
    setUnlocking(true);
    try {
      const vaultRes = await fetch(getIPFSUrl(listing.cdrUUID));
      if (!vaultRes.ok) throw new Error("Failed to fetch vault from IPFS");
      const vaultWrapper = await vaultRes.json();

      const vaultB64 = vaultWrapper.encryptedVault;
      const vaultJsonStr = atob(vaultB64);
      const payload = JSON.parse(vaultJsonStr);

      const key = await importAESKey(new Uint8Array(payload.key));

      const response = await fetch(getIPFSUrl(payload.fileHash));
      if (!response.ok) throw new Error("Failed to fetch encrypted file from IPFS");
      const encryptedBuffer = await response.arrayBuffer();
      const encryptedBytes = new Uint8Array(encryptedBuffer);

      const iv = encryptedBytes.slice(0, 12);
      const ciphertext = encryptedBytes.slice(12);

      const decrypted = await decryptFile(ciphertext.buffer, key, iv);

      const filename = payload.filename || "report";
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      setDecryptedUrl(url);
      setDecryptedFilename(filename);
    } catch (err) {
      console.error("Unlock failed:", err);
      alert("Failed to decrypt report. Please check that you have purchased a valid license and try again.");
    } finally {
      setUnlocking(false);
    }
  };

  const sendTip = async () => {
    if (!walletClient || !tipAmount) return;
    await walletClient.writeContract({
      chain: storyAeneid,
      address: VULNVAULT_REGISTRY,
      abi: VULNVAULT_ABI,
      functionName: "sendTip",
      args: [listing.seller],
      value: parseEther(tipAmount),
    });
    setShowTip(false);
    setTipAmount("");
  };

  return (
    <div className="border border-vault-gray-800 bg-vault-gray-950">
      <div className="border-b border-vault-gray-800 p-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-vault-gray-400" />
          <h3 className="font-mono text-sm font-bold text-vault-white">PROTECTED PREVIEW</h3>
        </div>
      </div>

      <div className="p-6">
        {!hasAccess ? (
          <div className="text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-vault-gray-600" />
            <p className="font-mono text-sm text-vault-gray-300">
              Full report encrypted via CDR
            </p>
            <p className="mt-2 font-mono text-xs text-vault-gray-500">
              {isWhitelistOnly 
                ? "This is a whitelisted report. Seller approval required."
                : "Purchase license to threshold-decrypt"}
            </p>
            
            {isSeller ? (
              <div className="mt-6 border-t border-vault-gray-800 pt-6 text-left">
                <h4 className="font-mono text-sm font-bold text-vault-white mb-4">Interested Buyers</h4>
                {interestedBuyers.length === 0 ? (
                  <p className="font-mono text-xs text-vault-gray-500">No expressions of interest yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {interestedBuyers.map((buyer, idx) => (
                      <li key={idx} className="flex items-center justify-between font-mono text-xs text-vault-gray-400 bg-vault-black p-3 border border-vault-gray-800">
                        <span>{buyer.slice(0, 6)}...{buyer.slice(-4)}</span>
                        <button 
                          onClick={() => approveBuyer(buyer)}
                          className="border border-vault-white px-3 py-1 hover:bg-vault-white hover:text-vault-black text-vault-white"
                        >
                          Approve
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : isWhitelistOnly && !isWhitelisted ? (
              <button
                onClick={expressInterest}
                disabled={hasExpressedInterest || isExpressingInterest}
                className="mt-6 border border-vault-white px-6 py-2 font-mono text-sm text-vault-white hover:bg-vault-white hover:text-vault-black disabled:opacity-50"
              >
                {isExpressingInterest ? "PROCESSING..." : hasExpressedInterest ? "INTEREST EXPRESSED" : "EXPRESS INTEREST"}
              </button>
            ) : (
              <button
                onClick={purchase}
                className="mt-6 border border-vault-white px-6 py-2 font-mono text-sm text-vault-white hover:bg-vault-white hover:text-vault-black"
              >
                PURCHASE FOR {formatEther(listing.price)} IP
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-vault-white">
              <Unlock className="h-4 w-4" />
              <span className="font-mono text-sm">ACCESS GRANTED</span>
            </div>

            {!decryptedUrl ? (
              <button
                onClick={unlock}
                disabled={unlocking}
                className="flex items-center gap-2 border border-vault-gray-600 px-4 py-2 font-mono text-xs text-vault-gray-300 hover:border-vault-white hover:text-vault-white"
              >
                {unlocking ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-vault-gray-600 border-t-vault-white" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                {unlocking
                  ? "DECRYPTING..."
                  : "DECRYPT & DOWNLOAD"}
              </button>
            ) : (
              <a
                href={decryptedUrl}
                download={decryptedFilename}
                className="flex items-center gap-2 border border-vault-white bg-vault-white px-4 py-2 font-mono text-xs text-vault-black"
              >
                <Download className="h-3 w-3" />
                DOWNLOAD DECRYPTED REPORT
              </a>
            )}

            <div className="border-t border-vault-gray-800 pt-4">
              {!showTip ? (
                <button
                  onClick={() => setShowTip(true)}
                  className="flex items-center gap-2 font-mono text-xs text-vault-gray-400 hover:text-vault-white"
                >
                  <Send className="h-3 w-3" />
                  SEND TIP TO RESEARCHER
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="IP amount"
                    className="w-24 border border-vault-gray-700 bg-vault-black p-2 font-mono text-xs text-vault-white"
                  />
                  <button
                    onClick={sendTip}
                    className="border border-vault-white px-3 py-2 font-mono text-xs text-vault-white hover:bg-vault-white hover:text-vault-black"
                  >
                    SEND
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
