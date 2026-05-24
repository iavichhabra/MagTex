"use client";

import { useState, useRef } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Lock, FileText, AlertCircle } from "lucide-react";
import { ReportMetadata, Category, Severity } from "@/types";
import { generateAESKey, exportAESKey, encryptFile } from "@/lib/crypto";
import { encryptReportVault } from "@/lib/cdr-client";
import { registerIPAsset } from "@/lib/story-client";
import { uploadJSONToIPFS, uploadFileToIPFS } from "@/lib/ipfs";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";

const CATEGORIES: Category[] = [
  "Critical Vulnerability",
  "High Severity Vulnerability",
  "Smart Contract Exploit",
  "Infrastructure Vulnerability",
  "Access Control Issue",
  "Economic Attack Vector",
  "Oracle Manipulation",
  "MEV Related Finding",
  "Security Research",
];

const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low", "Informational"];

export function ReportForm() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState<ReportMetadata>({
    title: "",
    severity: "High",
    category: "Critical Vulnerability",
    affectedProject: "",
    description: "",
    price: "0.1",
    abstract: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [txHash, setTxHash] = useState("");

  const handleSubmit = async () => {
    if (!walletClient || !address || !file) return;
    setLoading(true);

    try {
      setStep(2);
      const aesKey = await generateAESKey();
      const { ciphertext, iv } = await encryptFile(file, aesKey);
      const keyData = await exportAESKey(aesKey);

      setStep(3);
      const encryptedBlob = new Blob([new Uint8Array(iv), new Uint8Array(ciphertext)]);
      const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted`);
      const fileHash = await uploadFileToIPFS(encryptedFile);

      setStep(4);
      const vaultPayload = JSON.stringify({
        key: Array.from(keyData),
        iv: Array.from(iv),
        fileHash,
        filename: file.name,
      });
      const cdrUUID = await encryptReportVault(
        walletClient,
        address,
        new TextEncoder().encode(vaultPayload)
      );

      setStep(5);
      const metadataHash = await uploadJSONToIPFS({
        ...metadata,
        abstract: metadata.abstract,
        fullReportUUID: cdrUUID,
        fileHash,
        seller: address,
      });

      const nftHash = await uploadJSONToIPFS({
        name: `VulnVault: ${metadata.title}`,
        description: metadata.abstract,
      });

      const ipResult = await registerIPAsset(walletClient, metadata, {
        metadata: metadataHash,
        nft: nftHash,
      });

      setStep(6);
      const tx = await walletClient.writeContract({
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "listReport",
        args: [
          ipResult.ipId as `0x${string}`,
          cdrUUID,
          parseEther(metadata.price),
          metadataHash,
          BigInt(ipResult.licenseTermsId || 1),
        ],
      });

      setTxHash(tx);
      setStep(7);
      setTimeout(() => router.push("/marketplace"), 2000);
    } catch (err) {
      console.error(err);
      alert("Transaction failed. Check console for details.");
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

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-vault-gray-400 mb-2">TITLE</label>
            <input
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white focus:border-vault-white focus:outline-none"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              placeholder="Enter report title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-vault-gray-400 mb-2">SEVERITY</label>
              <select
                className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white"
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
              <label className="block font-mono text-xs text-vault-gray-400 mb-2">CATEGORY</label>
              <select
                className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white"
                value={metadata.category}
                onChange={(e) =>
                  setMetadata({ ...metadata, category: e.target.value as Category })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-vault-gray-400 mb-2">
              AFFECTED PROJECT
            </label>
            <input
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white focus:border-vault-white focus:outline-none"
              value={metadata.affectedProject}
              onChange={(e) =>
                setMetadata({ ...metadata, affectedProject: e.target.value })
              }
              placeholder="e.g., Uniswap V3, Aave V2..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-vault-gray-400 mb-2">PRICE (IP)</label>
            <input
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white focus:border-vault-white focus:outline-none"
              value={metadata.price}
              onChange={(e) => setMetadata({ ...metadata, price: e.target.value })}
              type="number"
              step="0.01"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-vault-gray-400 mb-2">
              PUBLIC ABSTRACT
            </label>
            <textarea
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white focus:border-vault-white focus:outline-none"
              rows={4}
              value={metadata.abstract}
              onChange={(e) => setMetadata({ ...metadata, abstract: e.target.value })}
              placeholder="Public summary visible to all buyers..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-vault-gray-400 mb-2">
              FULL DESCRIPTION
            </label>
            <textarea
              className="w-full border border-vault-gray-800 bg-vault-black p-3 font-mono text-sm text-vault-white focus:border-vault-white focus:outline-none"
              rows={6}
              value={metadata.description}
              onChange={(e) =>
                setMetadata({ ...metadata, description: e.target.value })
              }
              placeholder="Detailed technical description (encrypted)..."
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-vault-gray-400 mb-2">
              ENCRYPTED REPORT FILE
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-vault-gray-700 bg-vault-gray-950 p-8 hover:border-vault-gray-500"
            >
              <FileText className="h-8 w-8 text-vault-gray-500" />
              <span className="font-mono text-xs text-vault-gray-400">
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
            disabled={!metadata.title || !file || !metadata.abstract}
            className="w-full border border-vault-white bg-vault-white py-3 font-mono text-sm font-bold text-vault-black hover:bg-vault-gray-200 disabled:opacity-30"
          >
            ENCRYPT & PUBLISH
          </button>
        </motion.div>
      )}

      {step > 1 && step < 7 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-vault-gray-700 border-t-vault-white" />
          <p className="font-mono text-sm text-vault-gray-300">
            {step === 2 && "GENERATING AES-256 KEY..."}
            {step === 3 && "ENCRYPTING & UPLOADING TO IPFS..."}
            {step === 4 && "CREATING CDR VAULT..."}
            {step === 5 && "REGISTERING IP ASSET ON STORY..."}
            {step === 6 && "CONFIRMING ON-CHAIN LISTING..."}
          </p>
          <div className="mt-2 font-mono text-[10px] text-vault-gray-600">
            {txHash && `TX: ${txHash.slice(0, 20)}...`}
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="mb-4 h-8 w-8 text-vault-white" />
          <p className="font-mono text-sm text-vault-white">REPORT SECURED SUCCESSFULLY</p>
          <p className="mt-2 font-mono text-xs text-vault-gray-500">
            Redirecting to marketplace...
          </p>
        </div>
      )}
    </div>
  );
}
