"use client";

import { useState, useEffect } from "react";
import { Twitter, Github, Shield, Check, Globe, HelpCircle, Edit3, X as CloseIcon } from "lucide-react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectSocials() {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  
  const [xVal, setXVal] = useState("");
  const [githubVal, setGithubVal] = useState("");
  const [h1Val, setH1Val] = useState("");
  const [immunefiVal, setImmunefiVal] = useState("");

  const [xSaved, setXSaved] = useState("");
  const [githubSaved, setGithubSaved] = useState("");
  const [h1Saved, setH1Saved] = useState("");
  const [immunefiSaved, setImmunefiSaved] = useState("");

  useEffect(() => {
    if (address) {
      const x = localStorage.getItem(`x_handle_${address}`) || "";
      const gh = localStorage.getItem(`github_handle_${address}`) || "";
      const h1 = localStorage.getItem(`h1_handle_${address}`) || "";
      const imm = localStorage.getItem(`immunefi_handle_${address}`) || "";

      setXSaved(x);
      setGithubSaved(gh);
      setH1Saved(h1);
      setImmunefiSaved(imm);

      setXVal(x);
      setGithubVal(gh);
      setH1Val(h1);
      setImmunefiVal(imm);
    }
  }, [address]);

  const handleSave = () => {
    if (!address) return;

    const x = xVal.trim().replace("@", "");
    const gh = githubVal.trim().replace("@", "");
    const h1 = h1Val.trim().replace("@", "");
    const imm = immunefiVal.trim().replace("@", "");

    if (x) localStorage.setItem(`x_handle_${address}`, x);
    else localStorage.removeItem(`x_handle_${address}`);

    if (gh) localStorage.setItem(`github_handle_${address}`, gh);
    else localStorage.removeItem(`github_handle_${address}`);

    if (h1) localStorage.setItem(`h1_handle_${address}`, h1);
    else localStorage.removeItem(`h1_handle_${address}`);

    if (imm) localStorage.setItem(`immunefi_handle_${address}`, imm);
    else localStorage.removeItem(`immunefi_handle_${address}`);

    setXSaved(x);
    setGithubSaved(gh);
    setH1Saved(h1);
    setImmunefiSaved(imm);
    
    setIsEditing(false);
  };

  if (!address) return null;

  const isVerifiedResearcher = !!(githubSaved || h1Saved || immunefiSaved);

  return (
    <div className="mt-4">
      {/* Badges and Connected Accounts list */}
      <div className="flex flex-wrap items-center gap-3">
        {isVerifiedResearcher && (
          <div className="flex items-center gap-1 border border-vault-accent bg-vault-accent/10 px-2.5 py-1 text-vault-accent shadow-[0_0_10px_rgba(188,149,104,0.15)] rounded">
            <Shield className="h-3.5 w-3.5 fill-vault-accent/20" />
            <span className="font-mono text-xs font-bold tracking-wider uppercase">
              VERIFIED RESEARCHER
            </span>
          </div>
        )}

        {xSaved && (
          <a
            href={`https://x.com/${xSaved}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black px-2.5 py-1 font-mono text-xs text-vault-gray-300 hover:border-vault-gray-600 hover:text-vault-white rounded transition-colors"
          >
            <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
            <span>@{xSaved}</span>
          </a>
        )}

        {githubSaved && (
          <a
            href={`https://github.com/${githubSaved}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black px-2.5 py-1 font-mono text-xs text-vault-gray-300 hover:border-vault-gray-600 hover:text-vault-white rounded transition-colors"
          >
            <Github className="h-3.5 w-3.5 text-vault-white" />
            <span>{githubSaved}</span>
          </a>
        )}

        {h1Saved && (
          <a
            href={`https://hackerone.com/${h1Saved}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black px-2.5 py-1 font-mono text-xs text-vault-gray-300 hover:border-vault-gray-600 hover:text-vault-white rounded transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-[#f25f22]" />
            <span>H1: {h1Saved}</span>
          </a>
        )}

        {immunefiSaved && (
          <a
            href={`https://immunefi.com/profile/${immunefiSaved}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 border border-vault-gray-800 bg-vault-black px-2.5 py-1 font-mono text-xs text-vault-gray-300 hover:border-vault-gray-600 hover:text-vault-white rounded transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-[#1df296]" />
            <span>Immunefi: {immunefiSaved}</span>
          </a>
        )}

        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 border border-vault-gray-800 hover:border-vault-white bg-vault-black/50 px-2.5 py-1 font-mono text-[10px] text-vault-gray-500 hover:text-vault-white rounded transition-colors"
        >
          <Edit3 className="h-3 w-3" />
          MANAGE SOCIALS
        </button>
      </div>

      {/* Edit Overlay / Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-vault-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg shadow-2xl relative"
            >
              <button
                onClick={() => setIsEditing(false)}
                className="absolute right-4 top-4 text-vault-gray-500 hover:text-vault-white transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>

              <h3 className="font-mono text-base font-bold text-vault-white uppercase tracking-wider mb-1">
                Verify Researcher Identity
              </h3>
              <p className="font-mono text-[10px] text-vault-gray-500 mb-6">
                Link your profiles to build trust and show verified credentials.
              </p>

              <div className="space-y-4">
                {/* X */}
                <div>
                  <label className="block font-mono text-xs text-vault-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
                    X (TWITTER) HANDLE
                  </label>
                  <input
                    type="text"
                    value={xVal}
                    onChange={(e) => setXVal(e.target.value)}
                    placeholder="e.g. VulnVault"
                    className="w-full border border-vault-gray-700 bg-vault-black px-3 py-2 font-mono text-xs text-vault-white focus:border-vault-white focus:outline-none"
                  />
                </div>

                {/* Github */}
                <div>
                  <label className="block font-mono text-xs text-vault-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-vault-white" />
                    GITHUB USERNAME
                  </label>
                  <input
                    type="text"
                    value={githubVal}
                    onChange={(e) => setGithubVal(e.target.value)}
                    placeholder="e.g. octocat"
                    className="w-full border border-vault-gray-700 bg-vault-black px-3 py-2 font-mono text-xs text-vault-white focus:border-vault-white focus:outline-none"
                  />
                </div>

                {/* HackerOne */}
                <div>
                  <label className="block font-mono text-xs text-vault-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-[#f25f22]" />
                    HACKERONE USERNAME
                  </label>
                  <input
                    type="text"
                    value={h1Val}
                    onChange={(e) => setH1Val(e.target.value)}
                    placeholder="e.g. h1_researcher"
                    className="w-full border border-vault-gray-700 bg-vault-black px-3 py-2 font-mono text-xs text-vault-white focus:border-vault-white focus:outline-none"
                  />
                </div>

                {/* Immunefi */}
                <div>
                  <label className="block font-mono text-xs text-vault-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-[#1df296]" />
                    IMMUNEFI USERNAME
                  </label>
                  <input
                    type="text"
                    value={immunefiVal}
                    onChange={(e) => setImmunefiVal(e.target.value)}
                    placeholder="e.g. imm_hunter"
                    className="w-full border border-vault-gray-700 bg-vault-black px-3 py-2 font-mono text-xs text-vault-white focus:border-vault-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 border border-vault-accent bg-vault-accent/10 py-2.5 font-mono text-xs font-bold text-vault-accent hover:bg-vault-accent/20 transition-all rounded"
                >
                  SAVE CREDENTIALS
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-vault-gray-700 hover:border-vault-white py-2.5 font-mono text-xs text-vault-gray-400 hover:text-vault-white transition-all rounded"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
