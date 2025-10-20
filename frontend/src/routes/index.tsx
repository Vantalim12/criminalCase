import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LiveFeed } from "../components/LiveFeed";
import { Stats } from "../components/Stats";
import { HowItWorks } from "../components/HowItWorks";
import { ContractAddress } from "../components/ContractAddress";
import { AdminPanel } from "../components/AdminPanel";
import { isAdminWallet } from "../lib/admin";

const IndexPage: React.FC = () => {
  const { publicKey } = useWallet();
  const isAdmin = isAdminWallet(publicKey?.toBase58() || null);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-heading text-6xl text-gold mb-4">
          CRIMINAL CASE: IRL FINDS
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Hold $FIND tokens and become the highest holder to get a chance to
          find real-life items during 3-minute submission windows every 25
          minutes!
        </p>
      </div>

      <ContractAddress />

      {/* Admin Panel - Only shows when admin wallet is connected */}
      {isAdmin && (
        <div className="mb-8">
          <div className="text-center mb-4">
            <h2 className="font-heading text-4xl text-accent mb-2">
              🔐 ADMIN PANEL
            </h2>
            <p className="text-sm text-gray-400">
              Admin wallet detected - manage rounds and review submissions
            </p>
          </div>
          <AdminPanel />
        </div>
      )}

      <HowItWorks />

      <Stats />

      <LiveFeed />
    </div>
  );
};

export default IndexPage;
