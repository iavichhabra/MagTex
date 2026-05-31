import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";

export const metadata: Metadata = {
  title: "MagTex — Disclosure Without Exposure",
  description:
    "Private vulnerability marketplace powered by Story Protocol CDR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-vault-black text-vault-white antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WalletProvider>
            <LenisProvider>
              {/* Ambient background gradient mesh */}
              <div className="ambient-mesh" />
              <Navbar />
              <main className="min-h-screen pt-20 pb-24 md:pb-0">{children}</main>
              <MobileNav />
            </LenisProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
