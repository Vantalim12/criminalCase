import { solanaService } from "./solana.service";
import { supabaseService } from "./supabase.service";
import type { Holder } from "@discover/types";
import { HOLDER_SYNC_INTERVAL_MS } from "@discover/config";

class HolderService {
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSync: Date | null = null;
  private cachedHolders: Holder[] = [];

  /**
   * Start the holder sync background job
   */
  startSync(onUpdate?: (holders: Holder[]) => void) {
    console.log("Starting holder sync job...");

    // Initial sync
    this.syncHolders(onUpdate);

    // Set up interval
    this.syncInterval = setInterval(() => {
      this.syncHolders(onUpdate);
    }, HOLDER_SYNC_INTERVAL_MS);
  }

  /**
   * Stop the holder sync job
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("Holder sync job stopped");
    }
  }

  /**
   * Manually trigger a holder sync
   */
  async syncHolders(onUpdate?: (holders: Holder[]) => void) {
    try {
      // Get token address from environment variable or config
      const { env } = await import("../config/env.js");
      let tokenAddress = env.TOKEN_CONTRACT_ADDRESS;

      // Fallback to database config if env var not set
      if (!tokenAddress) {
        tokenAddress = await supabaseService.getConfig("token_address");
      }

      if (!tokenAddress) {
        console.warn(
          "Token address not configured in env or database, skipping holder sync"
        );
        return;
      }

      console.log("Syncing holders for token:", tokenAddress);

      // Fetch holders from Solana
      const rawHolders = await solanaService.fetchTokenHolders(tokenAddress);

      if (rawHolders.length === 0) {
        console.warn("No holders found");
        return;
      }

      // Calculate total supply
      const totalSupply = rawHolders.reduce((sum, h) => sum + h.balance, 0);

      // Transform and rank holders
      const holders: Holder[] = rawHolders.map((holder, index) => ({
        wallet_address: holder.address,
        balance: holder.balance,
        rank: index + 1,
        percentage: (holder.balance / totalSupply) * 100,
        last_updated: new Date().toISOString(),
      }));

      // Update database
      await supabaseService.upsertHolders(holders);

      // Update cache
      this.cachedHolders = holders;
      this.lastSync = new Date();

      console.log(`Synced ${holders.length} holders`);

      // Notify via callback
      if (onUpdate) {
        onUpdate(holders);
      }
    } catch (error: any) {
      console.error("Error syncing holders:", error);

      // Handle rate limiting specifically
      if (
        error.message?.includes("429") ||
        error.message?.includes("Too Many Requests")
      ) {
        console.warn("Rate limited by Solana RPC. Consider:");
        console.warn(
          "1. Using a paid RPC provider (Helius, QuickNode, Alchemy)"
        );
        console.warn("2. Increasing HOLDER_SYNC_INTERVAL_MS in config");
        console.warn("3. Waiting before retrying");

        // Skip this sync and try again later
        return;
      }

      // For other errors, still log but don't crash
      console.error("Non-rate-limit error:", error.message);
    }
  }

  /**
   * Get top N holders
   */
  async getTopHolders(limit: number = 10): Promise<Holder[]> {
    return supabaseService.getTopHolders(limit);
  }

  /**
   * Get holder by address
   */
  async getHolderByAddress(address: string): Promise<Holder | null> {
    return supabaseService.getHolderByAddress(address);
  }

  /**
   * Get cached holders (for immediate response)
   */
  getCachedHolders(): Holder[] {
    return this.cachedHolders;
  }

  /**
   * Get the highest holder
   */
  async getHighestHolder(): Promise<Holder | null> {
    const holders = await this.getTopHolders(1);
    return holders[0] || null;
  }

  /**
   * Clear all cached holders data
   * Useful when changing token addresses
   */
  async clearCache(): Promise<void> {
    console.log("Clearing holders cache...");

    // Clear in-memory cache
    this.cachedHolders = [];
    this.lastSync = null;

    // Clear database cache
    await supabaseService.clearAllHolders();

    console.log("Holders cache cleared successfully");
  }

  /**
   * Restart the sync with a fresh token address
   */
  async restartSync(onUpdate?: (holders: Holder[]) => void): Promise<void> {
    console.log("Restarting holder sync...");

    // Stop current sync
    this.stopSync();

    // Clear cache
    await this.clearCache();

    // Start fresh sync
    this.startSync(onUpdate);

    console.log("Holder sync restarted successfully");
  }
}

export const holderService = new HolderService();
