import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Submission } from "@discover/types";
import { api } from "../lib/api";
import bs58 from "bs58";
import { format } from "date-fns";
import { shortenAddress } from "../lib/wallet";

interface RewardInfo {
  isConfigured: boolean;
  balance?: number;
  address?: string;
  message?: string;
}

export const AdminPanel: React.FC = () => {
  const { publicKey, signMessage } = useWallet();
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [newRoundTarget, setNewRoundTarget] = useState("");
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);
  const [rewardRecipient, setRewardRecipient] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardVolume, setRewardVolume] = useState("");
  const [sendingReward, setSendingReward] = useState(false);

  const fetchPendingSubmissions = async () => {
    if (!publicKey || !signMessage) return;

    try {
      const message = `Admin access\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      const data = await api.getPendingSubmissions({
        signature,
        message,
        walletAddress: publicKey.toBase58(),
      });

      setPendingSubmissions(data.submissions);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      alert(error.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardInfo = async () => {
    if (!publicKey || !signMessage) return;

    try {
      const message = `Admin access\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      const data = await api.getRewardInfo({
        signature,
        message,
        walletAddress: publicKey.toBase58(),
      });

      setRewardInfo(data);
    } catch (error: any) {
      console.error("Error fetching reward info:", error);
    }
  };

  useEffect(() => {
    if (publicKey && signMessage) {
      fetchPendingSubmissions();
      fetchRewardInfo();
    }
  }, [publicKey, signMessage]);

  const handleReview = async (
    id: string,
    status: "approved" | "rejected",
    notes: string
  ) => {
    if (!publicKey || !signMessage) return;

    setProcessing(id);

    try {
      const message = `Review submission\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      await api.updateSubmission(id, status, notes, {
        signature,
        message,
        walletAddress: publicKey.toBase58(),
      });

      // Remove from pending list
      setPendingSubmissions((prev) => prev.filter((s) => s.id !== id));
      alert(`Submission ${status}!`);
    } catch (error: any) {
      console.error("Error reviewing submission:", error);
      alert(error.message || "Failed to review submission");
    } finally {
      setProcessing(null);
    }
  };

  const handleStartNewRound = async () => {
    if (!publicKey || !signMessage) return;

    try {
      const message = `Start new round\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      await api.startNewRound(newRoundTarget, {
        signature,
        message,
        walletAddress: publicKey.toBase58(),
      });

      alert("New round started!");
      setNewRoundTarget("");
    } catch (error: any) {
      console.error("Error starting round:", error);
      alert(error.message || "Failed to start round");
    }
  };

  const handleSendReward = async () => {
    if (!publicKey || !signMessage) return;
    if (!rewardRecipient) {
      alert("Please enter recipient address");
      return;
    }

    setSendingReward(true);

    try {
      const message = `Send reward\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      const amount = rewardAmount ? parseFloat(rewardAmount) : undefined;
      const volume = rewardVolume ? parseFloat(rewardVolume) : undefined;

      const result = await api.sendReward(
        rewardRecipient,
        {
          signature,
          message,
          walletAddress: publicKey.toBase58(),
        },
        amount,
        volume
      );

      alert(
        `Reward sent successfully!\nAmount: ${result.amount} SOL\nSignature: ${result.signature}`
      );

      // Reset form and refresh reward info
      setRewardRecipient("");
      setRewardAmount("");
      setRewardVolume("");
      fetchRewardInfo();
    } catch (error: any) {
      console.error("Error sending reward:", error);
      alert(error.message || "Failed to send reward");
    } finally {
      setSendingReward(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="font-heading text-3xl mb-4">Admin Access Required</h2>
        <p className="text-gray-400">
          Please connect your wallet to access the admin panel
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-xl text-gray-400">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Start New Round */}
      <div className="bg-primary p-6 rounded-lg border-2 border-gold">
        <h2 className="font-heading text-3xl mb-4 text-gold">
          Start New Round
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newRoundTarget}
            onChange={(e) => setNewRoundTarget(e.target.value)}
            placeholder="Target item (optional)"
            className="flex-1 px-4 py-2 bg-secondary border border-gray-600 rounded text-white"
          />
          <button
            onClick={handleStartNewRound}
            className="bg-gold text-black font-bold px-6 py-2 rounded hover:bg-yellow-500"
          >
            Start Round
          </button>
        </div>
      </div>

      {/* Reward Wallet Info & Send Reward */}
      <div className="bg-primary p-6 rounded-lg border-2 border-green-500">
        <h2 className="font-heading text-3xl mb-4 text-green-400">
          💰 Reward System
        </h2>

        {rewardInfo?.isConfigured ? (
          <div className="space-y-4">
            {/* Reward Wallet Info */}
            <div className="bg-secondary p-4 rounded border border-green-600">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Reward Wallet:</span>
                  <div className="font-mono text-green-400 text-xs mt-1 break-all">
                    {rewardInfo.address}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Balance:</span>
                  <div className="text-2xl font-bold text-green-400 mt-1">
                    {rewardInfo.balance?.toFixed(4)} SOL
                  </div>
                </div>
              </div>
            </div>

            {/* Send Reward Form */}
            <div className="bg-secondary p-4 rounded border border-gray-600">
              <h3 className="font-heading text-xl mb-3 text-white">
                Send Reward to Winner
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Recipient Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={rewardRecipient}
                    onChange={(e) => setRewardRecipient(e.target.value)}
                    placeholder="Winner's wallet address"
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Fixed Amount (SOL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder="e.g. 0.1"
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      OR 24h Volume (SOL)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={rewardVolume}
                      onChange={(e) => setRewardVolume(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2 bg-primary border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-600 p-3 rounded text-xs text-blue-300">
                  <strong>💡 Formula:</strong> Base (0.01 SOL) + Volume Bonus (0.5% of 24h volume)
                  <br />
                  Leave both fields empty to use minimum (0.01 SOL)
                </div>

                <button
                  onClick={handleSendReward}
                  disabled={sendingReward || !rewardRecipient}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingReward ? "Sending..." : "💸 Send Reward"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-yellow-300">
              {rewardInfo?.message ||
                "Reward wallet not configured. Set REWARD_WALLET_PRIVATE_KEY in environment variables."}
            </p>
          </div>
        )}
      </div>

      {/* Pending Submissions */}
      <div className="bg-primary p-6 rounded-lg border-2 border-accent">
        <h2 className="font-heading text-3xl mb-4">
          Pending Submissions ({pendingSubmissions.length})
        </h2>

        {pendingSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No pending submissions
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-secondary p-4 rounded-lg border border-gray-600"
              >
                <img
                  src={submission.photo_url}
                  alt="Submission"
                  className="w-full h-64 object-contain bg-black rounded mb-4"
                />
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Wallet:</span>{" "}
                    <span className="font-mono">
                      {shortenAddress(submission.wallet_address, 6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Submitted:</span>{" "}
                    {format(
                      new Date(submission.submitted_at),
                      "MMM dd, yyyy HH:mm"
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      const notes = prompt("Add notes (optional):");
                      handleReview(submission.id, "approved", notes || "");
                    }}
                    disabled={processing === submission.id}
                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt("Reason for rejection (optional):");
                      handleReview(submission.id, "rejected", notes || "");
                    }}
                    disabled={processing === submission.id}
                    className="flex-1 bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
