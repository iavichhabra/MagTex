"use client";

import { useAccount } from "wagmi";
import { ReportForm } from "@/components/report-form";
import { Lock, Wallet } from "lucide-react";

export default function SubmitPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Wallet className="mx-auto mb-4 h-12 w-12 text-vault-gray-600" />
        <h2 className="font-mono text-xl font-bold text-vault-white">CONNECT WALLET</h2>
        <p className="mt-2 font-mono text-sm text-vault-gray-500">
          Connect your wallet to submit encrypted vulnerability reports
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Lock className="h-5 w-5 text-vault-white" />
        <h1 className="font-mono text-2xl font-bold text-vault-white">SUBMIT REPORT</h1>
      </div>
      <ReportForm />
    </div>
  );
}
