import React, { useMemo } from "react";
import { Outlet } from "@tanstack/react-router";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useWalletAdapters } from "../lib/wallet";
import { Header } from "../components/Header";

const RootLayout: React.FC = () => {
  const wallets = useWalletAdapters();
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] to-primary">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Outlet />
            </main>
            <footer className="mt-16 py-6 border-t-2 border-accent text-center text-gray-400">
              <p className="font-heading text-lg">
                $FIND - IRL Treasure Hunt Platform
              </p>
              <p className="text-sm mt-2">Powered by Solana & Supabase</p>
              <div className="mt-4">
                <a
                  href="https://x.com/findcoin67"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-yellow-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Follow @findcoin67
                </a>
              </div>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default RootLayout;
