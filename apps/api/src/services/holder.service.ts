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
      // Get token address from config
      const tokenAddress = await supabaseService.getConfig("token_address");

      if (!tokenAddress) {
        console.warn("Token address not configured, skipping holder sync");
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
    } catch (error) {
      console.error("Error syncing holders:", error);
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
}

export const holderService = new HolderService();
