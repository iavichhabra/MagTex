"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    question: "What is VulnVault?",
    answer: "VulnVault is a decentralized vulnerability marketplace. Security researchers can securely upload their reports, set a price, and buyers can purchase access using Story Protocol IP and threshold decryption.",
  },
  {
    question: "What is the difference between a Public and a Private listing?",
    answer: "A Public listing is visible to anyone browsing the VulnVault marketplace search and list views. A Private listing is hidden from all public views and searches, meaning it can only be accessed and purchased by users who have the direct URL link shared by the seller.",
  },
  {
    question: "Is the entire content of a report visible to the public?",
    answer: "No. VulnVault separates public metadata from private contents. Only the Title, Severity, Affected Project, and Public Abstract are visible to the public. The Full Description and the original Report File are private and fully encrypted locally in your browser using AES-256 before upload. They can only be decrypted and read by authorized buyers after a successful purchase on-chain.",
  },
  {
    question: "How does the 'Whitelist Only' access control work?",
    answer: "When a report is marked as 'Whitelist Only' (Approval Required), buyers cannot purchase it directly. They must click 'Express Interest' to send an on-chain request. The seller reviews the list of interested wallet addresses on the report details page and can 'Approve' them. Once approved, the whitelisted buyer can complete the purchase and decrypt the report.",
  },
  {
    question: "Can I tip a security researcher?",
    answer: "Yes! If a researcher has enabled tipping for their report, you will see a 'Voluntary Tip' section on the report details page. You can send any amount of IP (native Story Protocol token) directly to their wallet to show appreciation for their research, regardless of whether you have purchased the report.",
  },
  {
    question: "How do I enable or disable tipping on my reports?",
    answer: "When uploading a new report in the submit form, you will see an 'Enable Tipping' checkbox (turned on by default). You can uncheck this box to disable the tipping widget on that specific report page.",
  },
  {
    question: "How are reports securely encrypted and decrypted?",
    answer: "Before your report is uploaded to IPFS, it is encrypted locally in your browser using an AES-256 key. The decryption key is locked on-chain. Only buyers who make the required IP payment on-chain are granted the key via Story Protocol's CDR (Cross-Chain Data Rights) mechanism.",
  },
  {
    question: "How do I connect my social handles to build trust?",
    answer: "You can connect your X (Twitter), GitHub, HackerOne, and Immunefi accounts from the Dashboard or Profile page. Linking at least one developer/security platform (GitHub, HackerOne, Immunefi) awards you a gold 'Verified Researcher' badge to establish your reputation.",
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <HelpCircle className="mx-auto mb-4 h-12 w-12 text-vault-white" />
        <h1 className="font-mono text-3xl font-bold text-vault-white">FREQUENTLY ASKED QUESTIONS</h1>
        <p className="mt-4 font-mono text-vault-gray-400">
          Everything you need to know about using VulnVault.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="border border-vault-gray-800 bg-vault-black overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-vault-gray-950 transition-colors"
            >
              <span className="font-mono text-sm font-bold text-vault-white">{faq.question}</span>
              {openIndex === idx ? (
                <ChevronUp className="h-5 w-5 text-vault-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-vault-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 font-mono text-sm leading-relaxed text-vault-gray-400 border-t border-vault-gray-800">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
