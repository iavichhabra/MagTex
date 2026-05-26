import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "VulnVault — Disclosure Without Exposure",
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
            <Navbar />
            <main className="min-h-screen pt-16 pb-20 md:pb-0">{children}</main>
            <MobileNav />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
