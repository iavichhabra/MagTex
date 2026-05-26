"use client";

import { useState, useEffect } from "react";
import { Twitter } from "lucide-react";
import { useAccount } from "wagmi";

export function ConnectX() {
  const { address } = useAccount();
  const [handle, setHandle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(`x_handle_${address}`);
      if (saved) {
        setHandle(saved);
        setInputVal(saved);
      }
    }
  }, [address]);

  const handleSave = () => {
    if (!address) return;
    const val = inputVal.replace("@", "");
    localStorage.setItem(`x_handle_${address}`, val);
    setHandle(val);
    setIsEditing(false);
  };

  if (!address) return null;

  return (
    <div className="mt-4 flex items-center gap-3">
      {handle && !isEditing ? (
        <div className="flex items-center gap-2 border border-vault-gray-800 bg-vault-black px-3 py-1">
          <Twitter className="h-4 w-4 text-[#1DA1F2]" />
          <a
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-sm text-vault-white hover:underline"
          >
            @{handle}
          </a>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 font-mono text-[10px] text-vault-gray-500 hover:text-vault-white"
          >
            EDIT
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-sm text-vault-gray-500">
              @
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="X handle"
              className="border border-vault-gray-700 bg-vault-black py-1 pl-6 pr-2 font-mono text-sm text-vault-white focus:border-vault-white focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            className="border border-vault-white bg-vault-white px-3 py-1 font-mono text-sm text-vault-black hover:bg-vault-gray-200"
          >
            {handle ? "SAVE" : "CONNECT X"}
          </button>
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setInputVal(handle);
              }}
              className="font-mono text-xs text-vault-gray-500 hover:text-vault-white"
            >
              CANCEL
            </button>
          )}
        </div>
      )}
    </div>
  );
}
