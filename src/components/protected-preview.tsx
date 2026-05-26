"use client";

import { useState, useEffect } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Lock, Unlock, Eye, Download, Send } from "lucide-react";
import { Listing } from "@/types";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { decryptReportVault } from "@/lib/cdr-client";
import { importAESKey, decryptFile } from "@/lib/crypto";
import { getIPFSUrl } from "@/lib/ipfs";

export function ProtectedPreview({ listing }: { listing: Listing }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [hasAccess, setHasAccess] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState("");

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
    } catch (err) {
      console.error("Failed to check access:", err);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [address, publicClient, listing.id]);

  const purchase = async () => {
    if (!walletClient || !address) return;
    await walletClient.writeContract({
      address: VULNVAULT_REGISTRY,
      abi: VULNVAULT_ABI,
      functionName: "purchaseReport",
      args: [BigInt(listing.id)],
      value: listing.price,
    });
    await checkAccess();
  };

  const unlock = async () => {
    if (!walletClient) return;
    setUnlocking(true);
    try {
      const vaultData = await decryptReportVault(walletClient, listing.cdrUUID);
      const payload = JSON.parse(new TextDecoder().decode(vaultData));
      const key = await importAESKey(new Uint8Array(payload.key));
      const iv = new Uint8Array(payload.iv);

      const response = await fetch(getIPFSUrl(payload.fileHash));
      const encryptedBuffer = await response.arrayBuffer();
      const decrypted = await decryptFile(encryptedBuffer, key, iv);

      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);
      setDecryptedUrl(url);
    } catch (err) {
      console.error("Unlock failed:", err);
      alert("Failed to decrypt report. Ensure you have a valid license.");
    } finally {
      setUnlocking(false);
    }
  };

  const sendTip = async () => {
    if (!walletClient || !tipAmount) return;
    await walletClient.writeContract({
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
              Purchase license to threshold-decrypt
            </p>
            <button
              onClick={purchase}
              className="mt-6 border border-vault-white px-6 py-2 font-mono text-sm text-vault-white hover:bg-vault-white hover:text-vault-black"
            >
              PURCHASE FOR {formatEther(listing.price)} IP
            </button>
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
                  ? "REQUESTING THRESHOLD DECRYPTION..."
                  : "DECRYPT & DOWNLOAD"}
              </button>
            ) : (
              <a
                href={decryptedUrl}
                download
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
