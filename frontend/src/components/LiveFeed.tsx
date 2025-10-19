import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Holder, GameRound } from "@discover/types";
import { CountdownTimer } from "./CountdownTimer";
import { Top10Holders } from "./Top10Holders";
import { PhotoSubmission } from "./PhotoSubmission";
import { api } from "../lib/api";
import { socketClient } from "../lib/socket";

export const LiveFeed: React.FC = () => {
  const { publicKey } = useWallet();
  const [holders, setHolders] = useState<Holder[]>([]);
  const [round, setRound] = useState<GameRound | null>(null);
  const [phase, setPhase] = useState<"active" | "submission" | "ended">(
    "ended"
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if current user is the highest holder
  const isHighestHolder =
    publicKey &&
    round?.highest_holder_address &&
    publicKey.toBase58() === round.highest_holder_address;

  const canSubmit = isHighestHolder && phase === "submission";

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [holdersData, roundData] = await Promise.all([
          api.getHolders(),
          api.getCurrentRound(),
        ]);

        setHolders(holdersData.holders);
        setRound(roundData.round);
        setPhase(roundData.phase);
        setTimeRemaining(roundData.timeRemaining);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Setup WebSocket listeners
  useEffect(() => {
    const socket = socketClient.connect();

    socket.on("holders:updated", (data: { holders: Holder[] }) => {
      setHolders(data.holders);
    });

    socket.on("round:started", (data: { round: GameRound }) => {
      setRound(data.round);
      setPhase("active");
      setTimeRemaining(25 * 60 * 1000);
    });

    socket.on("round:submission_window", (data: { round: GameRound }) => {
      setRound(data.round);
      setPhase("submission");
      setTimeRemaining(3 * 60 * 1000);
    });

    return () => {
      socket.off("holders:updated");
      socket.off("round:started");
      socket.off("round:submission_window");
    };
  }, []);

  // Refresh round data periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const roundData = await api.getCurrentRound();
        setRound(roundData.round);
        setPhase(roundData.phase);
        setTimeRemaining(roundData.timeRemaining);
      } catch (error) {
        console.error("Error refreshing round:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <div className="font-heading text-3xl text-gold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Round Info */}
      <div className="bg-primary p-6 rounded-lg border-2 border-accent">
        <div className="text-center mb-4">
          <h2 className="font-heading text-4xl text-gold">
            {round ? `ROUND #${round.round_number}` : "NO ACTIVE ROUND"}
          </h2>
          {round?.target_item && (
            <p className="text-xl text-white mt-2">
              Target:{" "}
              <span className="text-accent font-bold">{round.target_item}</span>
            </p>
          )}
        </div>
      </div>

      {/* Timer & Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <CountdownTimer timeRemaining={timeRemaining} phase={phase} />

        <div className="bg-secondary p-6 rounded-lg border-2 border-accent">
          <h3 className="font-heading text-2xl mb-4 text-center">
            CURRENT LEADER
          </h3>
          {round?.highest_holder_address ? (
            <div className="text-center spotlight p-4">
              <div className="text-4xl mb-2">👑</div>
              <div className="font-mono text-gold text-lg break-all">
                {round.highest_holder_address}
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Balance:{" "}
                {round.highest_holder_balance?.toLocaleString() || "N/A"}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Waiting for holder data...
            </div>
          )}
        </div>
      </div>

      {/* Photo Submission (only for highest holder during submission window) */}
      {canSubmit && round && (
        <PhotoSubmission
          roundId={round.id}
          onSuccess={() => {
            // Refresh data after submission
            window.location.reload();
          }}
        />
      )}

      {/* Top 10 Holders */}
      <Top10Holders
        holders={holders}
        highestHolderAddress={round?.highest_holder_address}
      />
    </div>
  );
};
