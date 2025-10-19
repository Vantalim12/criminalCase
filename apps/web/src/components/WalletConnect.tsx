import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletConnect: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton />
    </div>
  );
};
