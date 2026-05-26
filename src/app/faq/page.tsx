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
    question: "How does the 'Whitelist Only' feature work?",
    answer: "When a seller marks a report as 'Whitelist Only', buyers cannot purchase it directly. Instead, they must click 'Express Interest'. The seller will review the interested buyers on the report page and 'Approve' them. Once approved, the buyer can purchase and decrypt the report.",
  },
  {
    question: "What does 'Private Listing' mean?",
    answer: "A private listing does not appear on the public marketplace. The seller must share the direct link with you for you to view or purchase it.",
  },
  {
    question: "How are my reports kept secure?",
    answer: "Before being uploaded to IPFS, your report is encrypted locally in your browser using an AES-256 key. Only buyers who successfully purchase the report on-chain are granted the decryption key via the Story Protocol CDR (Cross-Chain Data Rights) mechanism.",
  },
  {
    question: "How do I connect my X (Twitter) account?",
    answer: "You can connect your X account from your Dashboard or Profile page by entering your handle. This helps build reputation within the VulnVault community.",
  },
  {
    question: "What token is used for payments?",
    answer: "Payments are made in IP, the native token of the Story Protocol network.",
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
