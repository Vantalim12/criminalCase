import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import type { GameRound, Submission, Holder, Config } from "@discover/types";

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  }

  // Game Rounds
  async getCurrentRound(): Promise<GameRound | null> {
    const { data, error } = await this.client
      .from("game_rounds")
      .select("*")
      .in("status", ["active", "submission_window"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching current round:", error);
      return null;
    }

    return data;
  }

  async createRound(
    roundNumber: number,
    targetItem: string | null = null
  ): Promise<GameRound> {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 25 * 60 * 1000);

    const { data, error } = await this.client
      .from("game_rounds")
      .insert({
        round_number: roundNumber,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "active",
        target_item: targetItem,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRoundStatus(
    id: string,
    status: string,
    highestHolder?: { address: string; balance: number }
  ) {
    const updateData: any = { status };

    if (highestHolder) {
      updateData.highest_holder_address = highestHolder.address;
      updateData.highest_holder_balance = highestHolder.balance;
    }

    const { error } = await this.client
      .from("game_rounds")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
  }

  async getLastRoundNumber(): Promise<number> {
    const { data, error } = await this.client
      .from("game_rounds")
      .select("round_number")
      .order("round_number", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return 0;
    }

    return data?.round_number || 0;
  }

  // Submissions
  async createSubmission(
    roundId: string,
    walletAddress: string,
    photoUrl: string
  ): Promise<Submission> {
    const { data, error } = await this.client
      .from("submissions")
      .insert({
        round_id: roundId,
        wallet_address: walletAddress,
        photo_url: photoUrl,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPendingSubmissions(): Promise<Submission[]> {
    const { data, error } = await this.client
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getApprovedSubmissions(limit: number = 50): Promise<Submission[]> {
    const { data, error } = await this.client
      .from("submissions")
      .select("*")
      .eq("status", "approved")
      .order("submitted_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async updateSubmissionStatus(
    id: string,
    status: "approved" | "rejected",
    reviewerNotes?: string
  ): Promise<void> {
    const { error } = await this.client
      .from("submissions")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewerNotes,
      })
      .eq("id", id);

    if (error) throw error;
  }

  async getSubmissionByRoundAndWallet(
    roundId: string,
    walletAddress: string
  ): Promise<Submission | null> {
    const { data, error } = await this.client
      .from("submissions")
      .select("*")
      .eq("round_id", roundId)
      .eq("wallet_address", walletAddress)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching submission:", error);
      return null;
    }

    return data;
  }

  // Holders
  async upsertHolders(holders: Holder[]): Promise<void> {
    const { error } = await this.client
      .from("holders")
      .upsert(holders, { onConflict: "wallet_address" });

    if (error) throw error;
  }

  async getTopHolders(limit: number = 10): Promise<Holder[]> {
    const { data, error } = await this.client
      .from("holders")
      .select("*")
      .order("rank", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getHolderByAddress(address: string): Promise<Holder | null> {
    const { data, error } = await this.client
      .from("holders")
      .select("*")
      .eq("wallet_address", address)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching holder:", error);
      return null;
    }

    return data;
  }

  // Config
  async getConfig(key: string): Promise<any> {
    const { data, error } = await this.client
      .from("config")
      .select("value")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching config:", error);
      return null;
    }

    return data?.value;
  }

  async setConfig(key: string, value: any): Promise<void> {
    const { error } = await this.client.from("config").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) throw error;
  }

  /**
   * Clear all holders from the database
   * Useful when changing token addresses
   */
  async clearAllHolders(): Promise<void> {
    const { error } = await this.client
      .from("holders")
      .delete()
      .neq("wallet_address", ""); // Delete all records

    if (error) {
      console.error("Error clearing holders:", error);
      throw error;
    }

    console.log("All holders cleared from database");
  }

  // Storage
  async uploadPhoto(file: Buffer, filename: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from("submissions")
      .upload(filename, file, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = this.client.storage
      .from("submissions")
      .getPublicUrl(filename);

    return urlData.publicUrl;
  }

  // Stats
  async getStats() {
    const [rounds, submissions, approved, holders] = await Promise.all([
      this.client
        .from("game_rounds")
        .select("id", { count: "exact", head: true }),
      this.client
        .from("submissions")
        .select("id", { count: "exact", head: true }),
      this.client
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      this.client
        .from("holders")
        .select("wallet_address", { count: "exact", head: true }),
    ]);

    return {
      totalRounds: rounds.count || 0,
      totalSubmissions: submissions.count || 0,
      approvedFinds: approved.count || 0,
      currentHolders: holders.count || 0,
    };
  }
}

export const supabaseService = new SupabaseService();
