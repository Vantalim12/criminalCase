import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Submission } from "@discover/types";
import { api } from "../lib/api";
import bs58 from "bs58";
import { format } from "date-fns";
import { shortenAddress } from "../lib/wallet";

export const AdminPanel: React.FC = () => {
  const { publicKey, signMessage } = useWallet();
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [newRoundTarget, setNewRoundTarget] = useState("");

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

  useEffect(() => {
    if (publicKey && signMessage) {
      fetchPendingSubmissions();
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
