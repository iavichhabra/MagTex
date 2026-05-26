"use client";

import { useState, useRef } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, FileText, CheckCircle } from "lucide-react";
import { ReportMetadata, Category, Severity } from "@/types";
import { generateAESKey, exportAESKey, encryptFile } from "@/lib/crypto";
import { uploadJSONToIPFS, uploadFileToIPFS } from "@/lib/ipfs";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { storyAeneid } from "@/lib/chains";

const CATEGORIES: Category[] = ["Security Research"];

const SEVERITIES: Severity[] = ["Critical", "Severe", "High"];

// Browser-safe base64 encoding (no Node.js Buffer needed)
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function ReportForm() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState<ReportMetadata>({
    title: "",
    severity: "Severe",
    category: "Security Research",
    affectedProject: "",
    description: "",
    price: "0.1",
    abstract: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!walletClient || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!file) {
      setError("Please upload a report file.");
      return;
    }
    if (!metadata.title || !metadata.abstract) {
      setError("Title and Abstract are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 2: Generate AES-256 key & encrypt the file locally in the browser
      setStep(2);
      const aesKey = await generateAESKey();
      const { ciphertext, iv } = await encryptFile(file, aesKey);
      const keyData = await exportAESKey(aesKey);

      // Step 3: Upload the encrypted file blob to IPFS via Pinata
      setStep(3);
      const encryptedBlob = new Blob([new Uint8Array(iv), new Uint8Array(ciphertext)]);
      const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted`);

      let fileHash: string;
      try {
        fileHash = await uploadFileToIPFS(encryptedFile);
      } catch (ipfsErr: any) {
        throw new Error(`IPFS file upload failed: ${ipfsErr?.message || "Unknown error"}. Check your Pinata API key.`);
      }

      // Step 4: Create the encrypted vault payload and upload to IPFS
      // Uses browser-native btoa() instead of Node.js Buffer
      setStep(4);
      const vaultPayload = JSON.stringify({
        key: Array.from(keyData),
        iv: Array.from(iv),
        fileHash,
        filename: file.name,
      });
      const vaultPayloadBytes = new TextEncoder().encode(vaultPayload);
      const vaultPayloadBase64 = uint8ArrayToBase64(vaultPayloadBytes);

      let vaultHash: string;
      try {
        vaultHash = await uploadJSONToIPFS({
          encryptedVault: vaultPayloadBase64,
          seller: address,
          timestamp: Date.now(),
        });
      } catch (vaultErr: any) {
        throw new Error(`Vault IPFS upload failed: ${vaultErr?.message || "Unknown error"}`);
      }

      // Step 5: Upload listing metadata to IPFS
      setStep(5);
      let metadataHash: string;
      try {
        metadataHash = await uploadJSONToIPFS({
          ...metadata,
          fullReportHash: vaultHash,
          fileHash,
          seller: address,
        });
      } catch (metaErr: any) {
        throw new Error(`Metadata IPFS upload failed: ${metaErr?.message || "Unknown error"}`);
      }

      // Step 6: Call listReport on the VulnVaultRegistry smart contract
      setStep(6);
      const ipId = "0x0000000000000000000000000000000000000001" as `0x${string}`;

      const tx = await walletClient.writeContract({
        chain: storyAeneid,
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "listReport",
        args: [
          ipId,
          vaultHash,
          parseEther(metadata.price),
          metadataHash,
          BigInt(1),
        ],
      });

      setTxHash(tx);
      setStep(7);
      setTimeout(() => router.push("/marketplace"), 3000);
    } catch (err: any) {
      console.error("Submit error:", err);
      // Extract the most useful error message
      const msg =
        err?.shortMessage ||
        err?.details ||
        err?.message ||
        "Transaction failed. Please try again.";
      setError(msg);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-2 border-b border-vault-gray-800 pb-4">
        <Lock className="h-5 w-5 text-vault-white" />
        <h2 className="font-mono text-xl font-bold text-vault-white">SUBMIT REPORT</h2>
      </div>

      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= step ? "bg-vault-white" : "bg-vault-gray-800"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 border border-red-800 bg-red-950/50 p-3 font-mono text-xs text-red-400">
          <span className="font-bold">ERROR: </span>{error}
        </div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">TITLE</label>
            <input
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-base text-vault-white focus:border-vault-white focus:outline-none"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              placeholder="Enter report title..."
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">SEVERITY</label>
            <select
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-base text-vault-white"
              value={metadata.severity}
              onChange={(e) =>
                setMetadata({ ...metadata, severity: e.target.value as Severity })
              }
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">
              AFFECTED PROJECT
            </label>
            <input
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-base text-vault-white focus:border-vault-white focus:outline-none"
              value={metadata.affectedProject}
              onChange={(e) =>
                setMetadata({ ...metadata, affectedProject: e.target.value })
              }
              placeholder="e.g., Uniswap V3, Aave V2..."
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">PRICE (IP)</label>
            <input
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-base text-vault-white focus:border-vault-white focus:outline-none"
              value={metadata.price}
              onChange={(e) => setMetadata({ ...metadata, price: e.target.value })}
              type="number"
              step="0.01"
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">
              PUBLIC ABSTRACT
            </label>
            <textarea
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-base text-vault-white focus:border-vault-white focus:outline-none"
              rows={4}
              value={metadata.abstract}
              onChange={(e) => setMetadata({ ...metadata, abstract: e.target.value })}
              placeholder="Public summary visible to all buyers..."
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">
              FULL DESCRIPTION
            </label>
            <textarea
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-base text-vault-white focus:border-vault-white focus:outline-none"
              rows={6}
              value={metadata.description}
              onChange={(e) =>
                setMetadata({ ...metadata, description: e.target.value })
              }
              placeholder="Detailed technical description (encrypted)..."
            />
          </div>

          <div>
            <label className="block font-mono text-sm font-semibold text-vault-gray-400 mb-2">
              ENCRYPTED REPORT FILE
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-vault-gray-700 bg-vault-gray-950 p-8 hover:border-vault-gray-500"
            >
              <FileText className="h-8 w-8 text-vault-gray-500" />
              <span className="font-mono text-sm text-vault-gray-400">
                {file ? file.name : "Click to upload PDF, MD, or TXT"}
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.md,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!metadata.title || !file || !metadata.abstract || loading}
            className="w-full border border-vault-white bg-vault-white py-3 font-mono text-sm font-bold text-vault-black hover:bg-vault-gray-200 disabled:opacity-30"
          >
            {loading ? "PROCESSING..." : "ENCRYPT & PUBLISH"}
          </button>
        </motion.div>
      )}

      {step > 1 && step < 7 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-vault-gray-700 border-t-vault-white" />
          <p className="font-mono text-sm text-vault-gray-300">
            {step === 2 && "GENERATING AES-256 KEY..."}
            {step === 3 && "ENCRYPTING & UPLOADING TO IPFS..."}
            {step === 4 && "CREATING ENCRYPTED VAULT..."}
            {step === 5 && "UPLOADING METADATA TO IPFS..."}
            {step === 6 && "CONFIRMING ON-CHAIN LISTING..."}
          </p>
          <div className="mt-2 font-mono text-[10px] text-vault-gray-600">
            {txHash && `TX: ${txHash.slice(0, 20)}...`}
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle className="mb-4 h-8 w-8 text-green-400" />
          <p className="font-mono text-sm text-vault-white">REPORT SECURED SUCCESSFULLY</p>
          <p className="mt-2 font-mono text-xs text-vault-gray-500">
            Redirecting to marketplace...
          </p>
          {txHash && (
            <a
              href={`https://aeneid.explorer.story.foundation/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 font-mono text-xs text-vault-gray-400 hover:text-vault-white underline"
            >
              View on Explorer →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
