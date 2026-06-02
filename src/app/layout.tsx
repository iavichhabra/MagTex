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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname === '/' && !sessionStorage.getItem('mgx-preloaded')) {
                  document.documentElement.classList.add('preloader-active');
                }
              } catch (e) {
                console.error(e);
              }
            `,
          }}
        />
      </head>
      <body className="bg-vault-black text-vault-white antialiased">
        {/* Pure CSS MAGTEX Intro — zero downloads, instant render */}
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              <style>
                @keyframes mgx-letter-in {
                  0% { opacity: 0; transform: translateY(40px) scale(0.8); filter: blur(8px); }
                  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                @keyframes mgx-tagline-in {
                  0% { opacity: 0; transform: translateY(10px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes mgx-glow-pulse {
                  0%, 100% { text-shadow: 0 0 20px rgba(188,149,104,0.0); }
                  50% { text-shadow: 0 0 40px rgba(188,149,104,0.3), 0 0 80px rgba(188,149,104,0.1); }
                }
                @keyframes mgx-line-expand {
                  0% { transform: scaleX(0); }
                  100% { transform: scaleX(1); }
                }
                @keyframes mgx-fade-out {
                  0% { opacity: 1; }
                  100% { opacity: 0; visibility: hidden; }
                }
                #mgx-preloader {
                  display: none;
                  position: fixed; inset: 0; z-index: 99999;
                  flex-direction: column; align-items: center; justify-content: center;
                  background: #16120e;
                  animation: mgx-fade-out 0.6s ease-in-out 2.6s forwards;
                }
                html.preloader-active #mgx-preloader {
                  display: flex;
                }
                #mgx-preloader .mgx-letters {
                  display: flex; gap: 2px; align-items: center;
                }
                #mgx-preloader .mgx-letter {
                  font-family: 'Satoshi', system-ui, sans-serif;
                  font-size: clamp(2.5rem, 8vw, 5rem);
                  font-weight: 900;
                  color: #FAF6F0;
                  letter-spacing: 0.08em;
                  opacity: 0;
                  animation: mgx-letter-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards,
                             mgx-glow-pulse 2s ease-in-out 0.8s 1;
                }
                #mgx-preloader .mgx-letter:nth-child(1) { animation-delay: 0.1s, 0.8s; }
                #mgx-preloader .mgx-letter:nth-child(2) { animation-delay: 0.18s, 0.88s; }
                #mgx-preloader .mgx-letter:nth-child(3) { animation-delay: 0.26s, 0.96s; }
                #mgx-preloader .mgx-letter:nth-child(4) { animation-delay: 0.34s, 1.04s; }
                #mgx-preloader .mgx-letter:nth-child(5) { animation-delay: 0.42s, 1.12s; }
                #mgx-preloader .mgx-letter:nth-child(6) { animation-delay: 0.50s, 1.20s; }
                #mgx-preloader .mgx-line {
                  width: 80px; height: 1px;
                  background: linear-gradient(90deg, transparent, #bc9568, transparent);
                  margin: 16px 0;
                  transform-origin: center;
                  transform: scaleX(0);
                  animation: mgx-line-expand 0.6s cubic-bezier(0.16,1,0.3,1) 0.7s forwards;
                }
                #mgx-preloader .mgx-tagline {
                  font-family: 'Satoshi', system-ui, sans-serif;
                  font-size: clamp(0.65rem, 2vw, 0.8rem);
                  font-weight: 400;
                  color: rgba(250,246,240,0.4);
                  letter-spacing: 0.25em;
                  text-transform: uppercase;
                  opacity: 0;
                  animation: mgx-tagline-in 0.5s ease-out 1.0s forwards;
                }
              </style>
              <div id="mgx-preloader">
                <div class="mgx-letters">
                  <span class="mgx-letter">M</span>
                  <span class="mgx-letter">A</span>
                  <span class="mgx-letter">G</span>
                  <span class="mgx-letter">T</span>
                  <span class="mgx-letter">E</span>
                  <span class="mgx-letter">X</span>
                </div>
                <div class="mgx-line"></div>
                <div class="mgx-tagline">Disclosure Without Exposure</div>
              </div>
              <script>
                (function() {
                  var p = document.getElementById('mgx-preloader');
                  try {
                    if (window.location.pathname !== '/' || sessionStorage.getItem('mgx-preloaded')) {
                      if (p) p.style.display = 'none';
                      document.documentElement.classList.remove('preloader-active');
                      return;
                    }
                    sessionStorage.setItem('mgx-preloaded', 'true');
                  } catch (e) {
                    console.error(e);
                  }
                  setTimeout(function() {
                    document.documentElement.classList.remove('preloader-active');
                    if (p) setTimeout(function() { p.remove(); }, 700);
                  }, 2800);
                })();
              </script>
            `
          }}
        />
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
