"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    question: "What is MagTex?",
    answer: "MagTex is a decentralized vulnerability marketplace. Security researchers can securely upload their reports, set a price, and buyers can purchase access using Story Protocol IP and threshold decryption.",
  },
  {
    question: "What is the difference between a Public and a Private listing?",
    answer: "A Public listing is visible to anyone browsing the MagTex marketplace search and list views. A Private listing is hidden from all public views and searches, meaning it can only be accessed and purchased by users who have the direct URL link shared by the seller.",
  },
  {
    question: "Is the entire content of a report visible to the public?",
    answer: "No. MagTex separates public metadata from private contents. Only the Title, Severity, Affected Project, and Public Abstract are visible to the public. The Full Description and the original Report File are private and fully encrypted locally in your browser using AES-256 before upload. They can only be decrypted and read by authorized buyers after a successful purchase on-chain.",
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
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-center"
      >
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-vault-accent/10 border border-vault-accent/20 mb-6">
          <HelpCircle className="h-6 w-6 text-vault-accent" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-vault-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-vault-gray-400 max-w-lg mx-auto">
          Everything you need to know about using MagTex.
        </p>
      </motion.div>

      {/* FAQ List */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="rounded-2xl border border-vault-gray-800 bg-vault-gray-950/50 overflow-hidden transition-colors hover:border-vault-gray-700"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors"
            >
              <span className="font-display text-sm font-semibold text-vault-white pr-4">
                {faq.question}
              </span>
              <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                openIndex === idx 
                  ? "bg-vault-accent/10 text-vault-accent rotate-0" 
                  : "bg-vault-gray-900 text-vault-gray-500"
              }`}>
                {openIndex === idx ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <div className="pt-0 border-t border-vault-gray-800/50 pt-4">
                      <p className="text-sm leading-relaxed text-vault-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
