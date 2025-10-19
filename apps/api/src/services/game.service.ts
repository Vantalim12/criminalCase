import { supabaseService } from "./supabase.service";
import { holderService } from "./holder.service";
import type { GameRound } from "@discover/types";
import { ROUND_DURATION_MS, SUBMISSION_WINDOW_MS } from "@discover/config";

class GameService {
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Start the game round manager
   */
  startManager(onRoundChange?: (round: GameRound, phase: string) => void) {
    console.log("Starting game round manager...");

    // Check immediately
    this.checkRoundStatus(onRoundChange);

    // Set up interval to check every second
    this.checkInterval = setInterval(() => {
      this.checkRoundStatus(onRoundChange);
    }, 1000);
  }

  /**
   * Stop the game round manager
   */
  stopManager() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("Game round manager stopped");
    }
  }

  /**
   * Check current round status and handle transitions
   */
  private async checkRoundStatus(
    onRoundChange?: (round: GameRound, phase: string) => void
  ) {
    try {
      const currentRound = await supabaseService.getCurrentRound();

      if (!currentRound) {
        // No active round, create one
        await this.createNewRound(onRoundChange);
        return;
      }

      const now = Date.now();
      const startTime = new Date(currentRound.start_time).getTime();
      const elapsed = now - startTime;

      // Check if we should transition to submission window
      if (currentRound.status === "active" && elapsed >= ROUND_DURATION_MS) {
        await this.transitionToSubmissionWindow(currentRound, onRoundChange);
      }
      // Check if submission window is over
      else if (
        currentRound.status === "submission_window" &&
        elapsed >= ROUND_DURATION_MS + SUBMISSION_WINDOW_MS
      ) {
        await this.endRound(currentRound, onRoundChange);
      }
    } catch (error) {
      console.error("Error checking round status:", error);
    }
  }

  /**
   * Create a new round
   */
  private async createNewRound(
    onRoundChange?: (round: GameRound, phase: string) => void
  ) {
    const lastRoundNumber = await supabaseService.getLastRoundNumber();
    const newRound = await supabaseService.createRound(lastRoundNumber + 1);

    console.log(`Created new round #${newRound.round_number}`);

    if (onRoundChange) {
      onRoundChange(newRound, "started");
    }
  }

  /**
   * Transition round to submission window
   */
  private async transitionToSubmissionWindow(
    round: GameRound,
    onRoundChange?: (round: GameRound, phase: string) => void
  ) {
    const highestHolder = await holderService.getHighestHolder();

    await supabaseService.updateRoundStatus(
      round.id,
      "submission_window",
      highestHolder
        ? {
            address: highestHolder.wallet_address,
            balance: highestHolder.balance,
          }
        : undefined
    );

    console.log(
      `Round #${
        round.round_number
      } entered submission window. Highest holder: ${
        highestHolder?.wallet_address || "none"
      }`
    );

    if (onRoundChange) {
      const updatedRound = await supabaseService.getCurrentRound();
      if (updatedRound) {
        onRoundChange(updatedRound, "submission_window");
      }
    }
  }

  /**
   * End the current round
   */
  private async endRound(
    round: GameRound,
    onRoundChange?: (round: GameRound, phase: string) => void
  ) {
    await supabaseService.updateRoundStatus(round.id, "ended");

    console.log(`Round #${round.round_number} ended`);

    // Create next round
    await this.createNewRound(onRoundChange);
  }

  /**
   * Manually start a new round (admin action)
   */
  async manuallyStartRound(targetItem?: string): Promise<GameRound> {
    // End current round if exists
    const currentRound = await supabaseService.getCurrentRound();
    if (currentRound) {
      await supabaseService.updateRoundStatus(currentRound.id, "ended");
    }

    // Create new round
    const lastRoundNumber = await supabaseService.getLastRoundNumber();
    return supabaseService.createRound(lastRoundNumber + 1, targetItem);
  }

  /**
   * Get current round with phase information
   */
  async getCurrentRoundWithPhase(): Promise<{
    round: GameRound | null;
    phase: "active" | "submission" | "ended";
    timeRemaining: number;
  }> {
    const round = await supabaseService.getCurrentRound();

    if (!round) {
      return {
        round: null,
        phase: "ended",
        timeRemaining: 0,
      };
    }

    const now = Date.now();
    const startTime = new Date(round.start_time).getTime();
    const elapsed = now - startTime;

    let phase: "active" | "submission" | "ended";
    let timeRemaining: number;

    if (round.status === "active") {
      phase = "active";
      timeRemaining = Math.max(0, ROUND_DURATION_MS - elapsed);
    } else if (round.status === "submission_window") {
      phase = "submission";
      timeRemaining = Math.max(
        0,
        ROUND_DURATION_MS + SUBMISSION_WINDOW_MS - elapsed
      );
    } else {
      phase = "ended";
      timeRemaining = 0;
    }

    return {
      round,
      phase,
      timeRemaining,
    };
  }
}

export const gameService = new GameService();
