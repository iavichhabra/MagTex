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
              {/* Floating circular X icon on the left side */}
              <a
                href="https://x.com/Magtex_?s=20"
                target="_blank"
                rel="noreferrer"
                className="fixed left-4 bottom-24 md:left-8 md:bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-vault-accent/30 bg-vault-gray-950/80 text-vault-accent shadow-[0_0_15px_rgba(188,149,104,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-vault-accent hover:bg-vault-accent hover:text-vault-black hover:shadow-[0_0_25px_rgba(188,149,104,0.35)]"
                aria-label="X (formerly Twitter)"
              >
                <svg
                  className="h-4.5 w-4.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </LenisProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
