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
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default RootLayout;
