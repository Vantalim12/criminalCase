import React, { useState } from "react";
import { config } from "../lib/config";

export const ContractAddress: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const contractAddress = config.tokenContractAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!contractAddress || contractAddress === "YOUR_TOKEN_MINT_ADDRESS_HERE") {
    return null; // Don't show if no CA is configured
  }

  return (
    <div className="bg-secondary border-2 border-gold rounded-lg p-4 mb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-heading text-xl text-gold">
            📄 Contract Address:
          </span>
          <code className="text-gray-300 font-mono text-sm bg-primary px-3 py-1 rounded border border-accent">
            {contractAddress}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="bg-accent text-primary px-4 py-2 rounded font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <span>✅</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
