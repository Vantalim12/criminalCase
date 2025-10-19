import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { StatsResponse } from "@discover/types";

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-secondary p-4 rounded-lg border border-accent text-center">
        <div className="text-3xl font-bold text-gold">{stats.totalRounds}</div>
        <div className="text-sm text-gray-400 mt-1">Total Rounds</div>
      </div>
      <div className="bg-secondary p-4 rounded-lg border border-accent text-center">
        <div className="text-3xl font-bold text-gold">
          {stats.totalSubmissions}
        </div>
        <div className="text-sm text-gray-400 mt-1">Submissions</div>
      </div>
      <div className="bg-secondary p-4 rounded-lg border border-accent text-center">
        <div className="text-3xl font-bold text-gold">
          {stats.approvedFinds}
        </div>
        <div className="text-sm text-gray-400 mt-1">Approved Finds</div>
      </div>
      <div className="bg-secondary p-4 rounded-lg border border-accent text-center">
        <div className="text-3xl font-bold text-gold">
          {stats.currentHolders}
        </div>
        <div className="text-sm text-gray-400 mt-1">Active Holders</div>
      </div>
    </div>
  );
};
