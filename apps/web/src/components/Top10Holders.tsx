import React from "react";
import type { Holder } from "@discover/types";
import { shortenAddress } from "../lib/wallet";

interface Top10HoldersProps {
  holders: Holder[];
  highestHolderAddress?: string | null;
}

export const Top10Holders: React.FC<Top10HoldersProps> = ({
  holders,
  highestHolderAddress,
}) => {
  return (
    <div className="cork-board p-6 rounded-lg border-4 border-amber-800 shadow-2xl">
      <h2 className="font-heading text-3xl text-center mb-4 text-white">
        TOP HOLDERS
      </h2>
      <div className="bg-evidence/90 p-4 rounded shadow-inner">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="text-left py-2 font-bold text-gray-800">Rank</th>
              <th className="text-left py-2 font-bold text-gray-800">Wallet</th>
              <th className="text-right py-2 font-bold text-gray-800">
                Balance
              </th>
              <th className="text-right py-2 font-bold text-gray-800">%</th>
            </tr>
          </thead>
          <tbody>
            {holders.map((holder) => {
              const isHighest = holder.wallet_address === highestHolderAddress;
              return (
                <tr
                  key={holder.wallet_address}
                  className={`border-b border-gray-300 transition-all ${
                    isHighest
                      ? "bg-gold/30 font-bold spotlight"
                      : "hover:bg-gray-200/50"
                  }`}
                >
                  <td className="py-3 text-gray-900">
                    {isHighest && "👑 "}#{holder.rank}
                  </td>
                  <td className="py-3 font-mono text-gray-900">
                    {shortenAddress(holder.wallet_address, 6)}
                  </td>
                  <td className="py-3 text-right text-gray-900">
                    {holder.balance.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-900">
                    {holder.percentage.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
