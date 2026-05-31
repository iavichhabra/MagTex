"use client";

import { ReactNode, useState, useEffect } from "react";
import { RainbowKitProvider, connectorsForWallets, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, coinbaseWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { storyAeneid } from "@/lib/chains";
import { useTheme } from "next-themes";

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
    appName: "MagTex",
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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom premium theme options for RainbowKit matching our warm camel-brown colorway
  const customDarkTheme = darkTheme({
    accentColor: "#bc9568", // Camel accent
    accentColorForeground: "#16120e", // Deep warm black background
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  const customLightTheme = lightTheme({
    accentColor: "#bc9568", // Camel accent
    accentColorForeground: "#FAF6F0", // Warm cream text
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  const activeTheme = !mounted || theme === "dark" ? customDarkTheme : customLightTheme;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={activeTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
