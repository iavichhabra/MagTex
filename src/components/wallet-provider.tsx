"use client";

import { ReactNode, useState, useEffect } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { storyAeneid } from "@/lib/chains";
import { useTheme } from "next-themes";

// Use wagmi's native injected() connector only.
// This completely avoids WalletConnect WebSocket initialization,
// which crashes in dev mode when the relay rejects invalid project IDs
// or when the network blocks WebSocket connections.
const config = createConfig({
  connectors: [
    injected(),
  ],
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
