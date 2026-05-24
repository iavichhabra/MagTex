"use client";

import { ReactNode } from "react";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, coinbaseWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { storyAeneid } from "@/lib/chains";

const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";
const isValidWalletConnectId = /^[0-9a-fA-F]{32}$/.test(walletConnectId);

const wallets = isValidWalletConnectId 
  ? [metaMaskWallet, coinbaseWallet, walletConnectWallet]
  : [metaMaskWallet, coinbaseWallet];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: wallets,
    },
  ],
  {
    appName: "VulnVault",
    projectId: isValidWalletConnectId ? walletConnectId : "0123456789abcdef0123456789abcdef",
  }
);

const config = createConfig({
  connectors,
  chains: [storyAeneid],
  transports: {
    [storyAeneid.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
