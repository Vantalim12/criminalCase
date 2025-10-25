import { Router } from "express";
import { supabaseService } from "../services/supabase.service";
import { gameService } from "../services/game.service";
import { rewardService } from "../services/reward.service";
import { holderService } from "../services/holder.service";
import { verifyWallet } from "../middleware/auth.middleware";
import { verifyAdmin } from "../middleware/admin.middleware";

const router = Router();

// All admin routes require wallet authentication + admin verification
router.use(verifyWallet);
router.use(verifyAdmin);

/**
 * GET /api/admin/submissions/pending
 * Get all pending submissions
 */
router.get("/submissions/pending", async (req, res) => {
  try {
    const submissions = await supabaseService.getPendingSubmissions();
    res.json({ submissions });
  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    res.status(500).json({ error: "Failed to fetch pending submissions" });
  }
});

/**
 * PATCH /api/admin/submissions/:id
 * Approve or reject a submission
 */
router.patch("/submissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await supabaseService.updateSubmissionStatus(id, status, reviewerNotes);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ error: "Failed to update submission" });
  }
});

/**
 * POST /api/admin/rounds/start
 * Manually start a new round
 */
router.post("/rounds/start", async (req, res) => {
  try {
    const { targetItem } = req.body;
    const newRound = await gameService.manuallyStartRound(targetItem);
    res.json({ success: true, round: newRound });
  } catch (error) {
    console.error("Error starting new round:", error);
    res.status(500).json({ error: "Failed to start new round" });
  }
});

/**
 * PATCH /api/admin/config
 * Update configuration
 */
router.patch("/config", async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }

    // Validate allowed config keys
    const allowedKeys = ["token_address", "fee_pool_total"];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({ error: "Invalid config key" });
    }

    await supabaseService.setConfig(key, value);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Failed to update config" });
  }
});

/**
 * GET /api/admin/rewards/info
 * Get reward wallet information
 */
router.get("/rewards/info", async (req, res) => {
  try {
    const isConfigured = rewardService.isConfigured();

    if (!isConfigured) {
      return res.json({
        isConfigured: false,
        message:
          "Reward wallet not configured. Set REWARD_WALLET_PRIVATE_KEY in environment variables.",
      });
    }

    const balance = await rewardService.getRewardWalletBalance();
    const address = rewardService.getRewardWalletAddress();

    res.json({
      isConfigured: true,
      balance,
      address,
    });
  } catch (error) {
    console.error("Error fetching reward info:", error);
    res.status(500).json({ error: "Failed to fetch reward info" });
  }
});

/**
 * POST /api/admin/rewards/send
 * Send SOL reward to winner
 */
router.post("/rewards/send", async (req, res) => {
  try {
    const { recipientAddress, amount, volume24h } = req.body;

    if (!recipientAddress) {
      return res.status(400).json({ error: "Recipient address is required" });
    }

    let result;

    if (amount !== undefined) {
      // Send specific amount
      result = await rewardService.sendReward(recipientAddress, amount);
    } else {
      // Calculate and send based on volume
      result = await rewardService.sendCalculatedReward(
        recipientAddress,
        volume24h || 0
      );
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error sending reward:", error);
    res.status(500).json({ error: error.message || "Failed to send reward" });
  }
});

/**
 * POST /api/admin/rewards/calculate
 * Calculate reward amount based on volume
 */
router.post("/rewards/calculate", async (req, res) => {
  try {
    const { volume24h } = req.body;
    const amount = rewardService.calculateReward(volume24h || 0);

    res.json({
      amount,
      volume24h: volume24h || 0,
      formula: "Base (0.01 SOL) + Volume Bonus (0.5% of 24h volume)",
    });
  } catch (error) {
    console.error("Error calculating reward:", error);
    res.status(500).json({ error: "Failed to calculate reward" });
  }
});

/**
 * POST /api/admin/holders/clear-cache
 * Clear holders cache and restart sync with new token address
 */
router.post("/holders/clear-cache", async (req, res) => {
  try {
    await holderService.restartSync();
    res.json({
      success: true,
      message:
        "Holders cache cleared and sync restarted with new token address",
    });
  } catch (error) {
    console.error("Error clearing holders cache:", error);
    res.status(500).json({ error: "Failed to clear holders cache" });
  }
});

export default router;
